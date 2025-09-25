# TechOps Data Structure Documentation

<!-- 
  Data Structure Documentation
  
  This document provides comprehensive documentation for all data structures
  used in the TechOps project, including JSON schemas, field descriptions,
  validation rules, and usage examples.
  
  Last Updated: September 2025
  Maintainer: SIT120 Project Team
-->

## 📊 products-data.json

This file contains the product catalog data used throughout the TechOps website. The data is structured as a JSON array containing product objects.

### Product Object Structure

Each product in the array follows this schema:

```json
{
  "name": "string",           // Product display name (required)
  "price": number,            // Base price in USD (required)
  "description": "string",    // Product description for display (optional)
  "image": "string",          // Relative path to product image (optional)
  "category": "string",       // Product category for filtering (optional)
  "discountPercent": number   // Optional discount percentage (rarely used)
}
```

### Field Descriptions

- **name**: The product title displayed in cards and throughout the UI. Used as the unique identifier for cart operations.

- **price**: The original/base price of the product in USD. This is used for calculations and display. The first product automatically receives a 20% discount in featured sections.

- **description**: Marketing description shown in product cards. Should be concise but informative. Falls back to empty string if not provided.

- **image**: Path to the product image relative to the website root. Images should be in the `images/` directory. Falls back to `images/default.svg` if not provided or if image fails to load.

- **category**: Used for product filtering functionality on the products page. Common categories include "Laptops", "Peripherals", "Components", etc.

- **discountPercent**: Optional field for products that have a permanent discount. Most products rely on automatic discounting logic instead.

### Usage in Application

1. **Product Rendering**: The `renderProductCard()` function in `script.js` processes each product object to generate HTML cards.

2. **Featured Products**: The first product in the array automatically receives a 20% discount when displayed in featured sections.

3. **Search Functionality**: The search feature searches across `name`, `description`, and `category` fields.

4. **Category Filtering**: Products are filtered by exact `category` match on the products page.

5. **Cart Integration**: Products are added to cart using the `name` field as the unique identifier.

### Data Validation

The JavaScript code includes validation for:
- Products must have a `name` field to be considered valid
- Prices default to 0 if not provided
- Images fall back to default.svg if missing or broken
- Descriptions default to empty string if not provided

### Adding New Products

To add new products:
1. Add a new object to the array in `products-data.json`
2. Ensure the product has at least a `name` and `price`
3. Add the product image to the `images/` directory
4. Choose an appropriate `category` for filtering
5. Test the product appears correctly on the website

### Sample Product Entry

```json
{
  "name": "New Gaming Laptop",
  "price": 1899.99,
  "description": "Powerful gaming laptop with latest specs and RGB lighting.",
  "image": "images/new-gaming-laptop.jpg",
  "category": "Laptops"
}
```