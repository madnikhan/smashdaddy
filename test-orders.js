const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testOrders() {
  try {
    console.log('Testing database connection...');
    
    // Check if there are any orders
    const orders = await prisma.order.findMany({
      take: 5,
      include: {
        items: true,
        customer: {
          include: {
            user: true,
          },
        },
      },
    });
    
    console.log(`Found ${orders.length} orders:`);
    orders.forEach(order => {
      console.log(`- Order ${order.id}: ${order.status} (${order.orderNumber})`);
    });
    
    if (orders.length > 0) {
      const firstOrder = orders[0];
      console.log(`\nTesting status update for order ${firstOrder.id}...`);
      
      // Test status update
      const updatedOrder = await prisma.order.update({
        where: { id: firstOrder.id },
        data: {
          status: 'PREPARING',
          updatedAt: new Date(),
        },
      });
      
      console.log(`Successfully updated order status to: ${updatedOrder.status}`);
      
      // Revert back
      await prisma.order.update({
        where: { id: firstOrder.id },
        data: {
          status: firstOrder.status,
          updatedAt: new Date(),
        },
      });
      
      console.log('Reverted status back to original');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrders(); 