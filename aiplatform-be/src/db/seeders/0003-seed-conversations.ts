import { randomUUID } from 'crypto';

export async function up(queryInterface: any) {
  const now = new Date();
  
  const users = await queryInterface.sequelize.query(
    'SELECT id FROM users LIMIT 1',
    { type: queryInterface.sequelize.QueryTypes.SELECT }
  );
  
  if (users.length === 0) {
    console.log('No users found, skipping conversation seeding');
    return;
  }
  
  const userId = users[0].id;
  
  // Create sample conversations
  const conversations = [
    {
      id: randomUUID(),
      title: 'How to learn React?',
      userId,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), 
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: randomUUID(), 
      title: 'Best practices for coding',
      userId,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), 
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: randomUUID(),
      title: 'AI and Machine Learning',
      userId,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), 
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  await queryInterface.bulkInsert('conversations', conversations);

  // Create sample messages for each conversation
  const messages = [];
  const [conv1, conv2, conv3] = conversations;
  
  if (!conv1 || !conv2 || !conv3) {
    console.error('Failed to create conversations');
    return;
  }
  
  // Conversation 1: React learning
  messages.push(
    {
      id: randomUUID(),
      conversationId: conv1.id,
      role: 'user',
      content: JSON.stringify({ text: 'How should I start learning React?' }),
      createdAt: new Date(conv1.createdAt.getTime() + 1000),
      updatedAt: new Date(conv1.createdAt.getTime() + 1000),
    },
    {
      id: randomUUID(),
      conversationId: conv1.id,
      role: 'assistant',
      content: JSON.stringify({ 
        text: 'React is a JavaScript library for building user interfaces. Here\'s a great roadmap to get started:\n\n1. **JavaScript Fundamentals** - Make sure you understand ES6+ features\n2. **React Basics** - Components, JSX, Props\n3. **State Management** - useState, useEffect hooks\n4. **Project Practice** - Build small projects to apply what you learn\n\nWould you like me to elaborate on any of these steps?' 
      }),
      createdAt: new Date(conv1.createdAt.getTime() + 5000),
      updatedAt: new Date(conv1.createdAt.getTime() + 5000),
    }
  );

  // Conversation 2: Coding best practices
  messages.push(
    {
      id: randomUUID(),
      conversationId: conv2.id,
      role: 'user',
      content: JSON.stringify({ text: 'What are some essential coding best practices I should follow?' }),
      createdAt: new Date(conv2.createdAt.getTime() + 1000),
      updatedAt: new Date(conv2.createdAt.getTime() + 1000),
    },
    {
      id: randomUUID(),
      conversationId: conv2.id,
      role: 'assistant',
      content: JSON.stringify({ 
        text: 'Here are some fundamental coding best practices:\n\n**Code Quality:**\n• Write clean, readable code\n• Use meaningful variable and function names\n• Keep functions small and focused\n• Add comments for complex logic\n\n**Version Control:**\n• Commit often with clear messages\n• Use branching strategies\n• Review code before merging\n\n**Testing:**\n• Write unit tests\n• Test edge cases\n• Automate testing where possible\n\nWhich area would you like to dive deeper into?' 
      }),
      createdAt: new Date(conv2.createdAt.getTime() + 5000),
      updatedAt: new Date(conv2.createdAt.getTime() + 5000),
    }
  );

  // Conversation 3: AI and ML
  messages.push(
    {
      id: randomUUID(),
      conversationId: conv3.id,
      role: 'user',
      content: JSON.stringify({ text: 'Can you explain the difference between AI and Machine Learning?' }),
      createdAt: new Date(conv3.createdAt.getTime() + 1000),
      updatedAt: new Date(conv3.createdAt.getTime() + 1000),
    },
    {
      id: randomUUID(),
      conversationId: conv3.id,
      role: 'assistant',
      content: JSON.stringify({ 
        text: 'Great question! Here\'s the breakdown:\n\n**Artificial Intelligence (AI)** is the broader concept of machines performing tasks that typically require human intelligence.\n\n**Machine Learning (ML)** is a subset of AI that focuses on algorithms that can learn and improve from data without being explicitly programmed.\n\n**Key Differences:**\n• AI: The goal (intelligent behavior)\n• ML: The method (learning from data)\n• AI can include rule-based systems\n• ML specifically uses statistical methods\n\n**Example:** A chess program using pre-programmed moves is AI but not ML. A program that learns chess by playing millions of games is both AI and ML.\n\nWould you like to explore specific ML algorithms or AI applications?' 
      }),
      createdAt: new Date(conv3.createdAt.getTime() + 5000),
      updatedAt: new Date(conv3.createdAt.getTime() + 5000),
    }
  );

  await queryInterface.bulkInsert('messages', messages);
}

export async function down(queryInterface: any) {
  await queryInterface.bulkDelete('messages', {}, {});
  
  await queryInterface.bulkDelete('conversations', {
    title: ['How to learn React?', 'Best practices for coding', 'AI and Machine Learning'],
  }, {});
}