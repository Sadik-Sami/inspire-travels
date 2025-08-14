const express = require('express');
const User = require('../models/User');
const router = express.Router();

// @route POST /api/cron/cleanup-tokens
// @desc Clean up expired and used refresh tokens (Vercel Cron Job)
// @access Public (but should only be called by Vercel's cron system)
router.post('/cleanup-tokens', async (req, res) => {
	try {
		console.log('Starting scheduled token cleanup job...');

		const startTime = Date.now();
		const stats = {
			usedTokensRemoved: 0,
			expiredTokensRemoved: 0,
			excessiveTokensRemoved: 0,
			inactiveUsersCleared: 0,
			totalUsersCleaned: 0,
			executionTime: 0,
		};

		// 1. Remove used tokens older than 1 hour (they've served their purpose)
		console.log('Removing used tokens older than 1 hour...');
		const usedTokensResult = await User.updateMany(
			{
				'refreshTokens.isUsed': true,
				'refreshTokens.createdAt': {
					$lt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
				},
			},
			{
				$pull: {
					refreshTokens: {
						isUsed: true,
						createdAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) },
					},
				},
			}
		);
		stats.usedTokensRemoved = usedTokensResult.modifiedCount;

		// 2. Remove expired tokens (backup for TTL, in case it fails)
		console.log('Removing expired tokens...');
		const expiredTokensResult = await User.updateMany(
			{
				'refreshTokens.expiresAt': { $lt: new Date() },
			},
			{
				$pull: {
					refreshTokens: {
						expiresAt: { $lt: new Date() },
					},
				},
			}
		);
		stats.expiredTokensRemoved = expiredTokensResult.modifiedCount;

		// 3. Limit tokens per user (keep only the 3 most recent tokens per user)
		console.log('Limiting tokens per user to 3 most recent');
		const usersWithManyTokens = await User.find({
			$expr: { $gt: [{ $size: '$refreshTokens' }, 3] },
		});

		for (const user of usersWithManyTokens) {
			// Sort by createdAt descending and keep only the 3 most recent
			user.refreshTokens.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			const tokensToRemove = user.refreshTokens.length - 3;
			user.refreshTokens = user.refreshTokens.slice(0, 3);
			await user.save();
			stats.excessiveTokensRemoved += tokensToRemove;
		}

		// 4. Clear all tokens from users inactive for 60+ days
		console.log('Clearing tokens from inactive users (60+ days)...');
		const inactiveUsersResult = await User.updateMany(
			{
				updatedAt: { $lt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }, // 60 days
				'refreshTokens.0': { $exists: true }, // Has at least one token
			},
			{
				$set: { refreshTokens: [] },
			}
		);
		stats.inactiveUsersCleared = inactiveUsersResult.modifiedCount;

		// 5. Count total users that were cleaned
		stats.totalUsersCleaned =
			stats.usedTokensRemoved + stats.expiredTokensRemoved + usersWithManyTokens.length + stats.inactiveUsersCleared;

		stats.executionTime = Date.now() - startTime;

		console.log('Token cleanup completed successfully:', stats);

		// Return success response
		res.status(200).json({
			success: true,
			message: 'Token cleanup completed successfully',
			stats,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('❌ Token cleanup job failed:', error);

		// Return error response (Vercel will log this)
		res.status(500).json({
			success: false,
			message: 'Token cleanup job failed',
			error: error.message,
			timestamp: new Date().toISOString(),
		});
	}
});

// @route GET /api/cron/cleanup-tokens
// @desc Get cleanup job status (for testing/monitoring)
// @access Public
router.get('/cleanup-tokens', async (req, res) => {
	try {
		// Get some basic stats about current token state
		const totalUsers = await User.countDocuments();
		const usersWithTokens = await User.countDocuments({
			'refreshTokens.0': { $exists: true },
		});
		const usersWithUsedTokens = await User.countDocuments({
			'refreshTokens.isUsed': true,
		});
		const usersWithExpiredTokens = await User.countDocuments({
			'refreshTokens.expiresAt': { $lt: new Date() },
		});

		// Get users with excessive tokens
		const usersWithManyTokens = await User.countDocuments({
			$expr: { $gt: [{ $size: '$refreshTokens' }, 3] },
		});

		res.json({
			success: true,
			message: 'Token cleanup job status',
			currentStats: {
				totalUsers,
				usersWithTokens,
				usersWithUsedTokens,
				usersWithExpiredTokens,
				usersWithManyTokens,
				nextCleanupTime: '2:00 AM UTC daily',
			},
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error getting cleanup status:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get cleanup status',
			error: error.message,
		});
	}
});

module.exports = router;
