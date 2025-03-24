// __mocks__/mockData.js
module.exports = {
    mockUser: {
      _id: '507f1f77bcf86cd799439011',
      username: 'testuser',
      therapistId: '507f1f77bcf86cd799439012',
      preferences: { hand: 'right' }
    },
    mockAction: {
        userId: 'testUserId',
        timestamp: new Date().toISOString(),
        reactionTime: 500,
        finger: 'index',
        hand: 'right',
        gameMode: 'practice'
      }
  };
  