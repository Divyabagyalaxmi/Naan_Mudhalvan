import express from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order'; // assuming an Order model exists
import { User } from '../models/User'; // assuming a User model exists if needed

const router = express.Router();

// Route to get recommended products for a specific user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Step 1: Fetch user's past orders to understand their purchasing patterns.
    const userOrders = await Order.find({ userId });

    // Step 2: If the user has made no purchases, return trending products.
    if (userOrders.length === 0) {
      const trendingProducts = await Product.find({ isTrending: true }).limit(5);
      return res.json(trendingProducts);
    }

    // Step 3: Collect product categories from user's past orders
    const purchasedCategories = [...new Set(userOrders.map(order => order.category))];

    // Step 4: Find products in these categories, excluding the ones the user already purchased.
    const recommendedProducts = await Product.find({
      category: { $in: purchasedCategories },
      _id: { $nin: userOrders.map(order => order.productId) } // Exclude products already bought
    }).limit(5);

    // Step 5: If no recommended products, return trending products.
    if (recommendedProducts.length === 0) {
      const trendingProducts = await Product.find({ isTrending: true }).limit(5);
      return res.json(trendingProducts);
    }

    // Step 6: Return the recommended products
    res.json(recommendedProducts);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ message: "Error fetching recommendations" });
  }
});

export default router;
