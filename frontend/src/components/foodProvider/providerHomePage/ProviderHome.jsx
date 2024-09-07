import React from 'react';
import ProviderNavbar from '../providerNavbar/ProviderNavbar'
import test from '../../../assets/test.jpg'
import { motion } from 'framer-motion';

const ProviderHomePage = () => {

    const sortLinesForFoodCreators = [
        "Share Your Homemade Creations Today!",
        "Showcase Your Culinary Skills Now!",
        "Let Your Dishes Shine Today!",
        "Highlight Your Special Recipes!",
        "Present Your Fresh Creations to Food Lovers!",
        "Make Your Homemade Meals Available Now!",
        "Bring Your Delicious Dishes to Our Community!",
        "Share Your Cooking Passion with Us!",
        "Show Us Your Homemade Magic Today!",
        "Display Your Culinary Craftsmanship for Everyone!"
    ];    

    const bigLinesForFoodCreators = [
        "Craft your lovingly prepared meals and deliver them to those who appreciate your culinary artistry.",
        "Share your homemade culinary creations with those who crave your special touch.",
        "Bring your unique recipes to life and delight customers with your homemade masterpieces.",
        "Prepare and present your heartfelt dishes to a community eager to taste your passion.",
        "Showcase your cooking skills by offering fresh, homemade meals to hungry diners.",
        "Turn your kitchen creations into a culinary experience for others to enjoy.",
        "Let your homemade dishes shine by sharing them with food enthusiasts who value your craft.",
        "Create and serve your homemade delights, bringing joy to those who savor your cooking.",
        "Make your personal recipes available and spread the love through every delicious bite.",
        "Share your homemade specialties and turn your culinary talent into a delightful experience for others."
    ];

    const dishItemsSentences = [
        "Upload Your Tasty Treats",
        "Showcase Your Gourmet Dishes",
        "Add Your Flavorful Creations",
        "Present Your Signature Meals",
        "Introduce Your Dish Collection",
        "Share Your Culinary Masterpieces",
        "Enter Your Savory Selections",
        "Display Your Home-Cooked Wonders",
        "Feature Your Delicious Offerings",
        "Bring Your Kitchen Creations to the Table"
    ];
    
    const addNewIntem = () => {

        // Create the container with Tailwind CSS and custom styles
        const formContainer = document.createElement('div');
        formContainer.className = 'flex space-x-4 mt-3 flex-wrap gap-4 custom-form-container';

        // Create and style input for item name
        const itemNameInput = document.createElement('input');
        itemNameInput.type = 'text';
        itemNameInput.placeholder = 'Item Name';
        itemNameInput.className = 'flex-grow-[3.5] p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105';

        // Create and style input for item quantity
        const itemQuantityInput = document.createElement('input');
        itemQuantityInput.type = 'text';
        itemQuantityInput.placeholder = 'Item Quantity';
        itemQuantityInput.className = 'flex-grow-[3.5] p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105';

        // Create and style select for flavor
        const flavorSelect = document.createElement('select');
        flavorSelect.className = 'flex-grow-[3] p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105';

        // Create options for select
        const flavors = [
        'flavor', 'spicy', 'salty', 'sweet', 'sour',
        'bitter', 'savory', 'tangy', 'smoky', 'hot', 'peppery'
        ];

        flavors.forEach(flavor => {
        const option = document.createElement('option');
        option.value = flavor;
        option.textContent = flavor.charAt(0).toUpperCase() + flavor.slice(1); // Capitalize first letter
        flavorSelect.appendChild(option);
        });

        // Append inputs and select to the form container
        formContainer.appendChild(itemNameInput);
        formContainer.appendChild(itemQuantityInput);
        formContainer.appendChild(flavorSelect);

        // Append form container to the itemDetails container
        const itemDetailsContainer = document.getElementById('itemDetails');
        itemDetailsContainer.appendChild(formContainer);

        // Add CSS styles directly with unique class names
        const style = document.createElement('style');
        style.textContent = `
        .custom-form-container {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem; /* Matches Tailwind gap-4 */
        }
        .custom-form-container input, .custom-form-container select {
            padding: 0.75rem; /* Matches Tailwind p-3 */
            border: 1px solid #d1d5db; /* Matches Tailwind border-gray-300 */
            border-radius: 0.5rem; /* Matches Tailwind rounded-lg */
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Matches Tailwind shadow-md */
            transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        }
        .custom-form-container input:focus, .custom-form-container select:focus {
            border-color: #3b82f6; /* Matches Tailwind focus:ring-blue-500 */
            outline: none;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
            transform: scale(1.05);
        }
        .custom-form-container input {
            flex-grow: 3.5; /* Matches Tailwind flex-grow-[3.5] */
        }
        .custom-form-container select {
            flex-grow: 3; /* Matches Tailwind flex-grow-[3] */
        }
        .custom-form-container input:hover, .custom-form-container select:hover {
            transform: scale(1.05); /* Matches Tailwind hover:scale-105 */
        }
        `;
        document.head.appendChild(style);

    }

  return (
    <div>
        <ProviderNavbar />
        <section className="bg-gray-800 text-white text-center py-16 px-6">
            <div className="max-w-2xl mx-auto">
                <motion.h1
                className="text-4xl md:text-5xl font-bold leading-tight mb-6"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                >
                {sortLinesForFoodCreators[Math.floor(Math.random() * sortLinesForFoodCreators.length)]}
                </motion.h1>
                <motion.p
                className="text-lg md:text-xl font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                >
                {bigLinesForFoodCreators[Math.floor(Math.random() * bigLinesForFoodCreators.length)]}
                </motion.p>
            </div>
        </section>
        <motion.h1
          className='mb-2 mt-5 text-gray-900 font-bold text-2xl md:text-3xl lg:text-4xl text-center leading-tight'
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {dishItemsSentences[Math.floor(Math.random() * dishItemsSentences.length)]}
        </motion.h1>
        <div id="itemDetails">
            <motion.div
                className="flex space-x-4 flex-wrap gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                <motion.input
                    type="text"
                    placeholder="Item Name"
                    className="flex-grow-[3.5] p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
                    whileFocus={{ scale: 1.05 }}
                />
                <motion.input
                    type="text"
                    placeholder="Item Quantity"
                    className="flex-grow-[3.5] p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
                    whileFocus={{ scale: 1.05 }}
                />
                <motion.select
                    className="flex-grow-[3] p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
                    whileFocus={{ scale: 1.05 }}
                >
                    <option value="flavor">Flavor</option>
                    <option value="spicy">Spicy</option>
                    <option value="salty">Salty</option>
                    <option value="sweet">Sweet</option>
                    <option value="sour">Sour</option>
                    <option value="bitter">Bitter</option>
                    <option value="savory">Savory</option>
                    <option value="tangy">Tangy</option>
                    <option value="smoky">Smoky</option>
                    <option value="hot">Hot</option>
                    <option value="peppery">Peppery</option>
                </motion.select>
            </motion.div>
        </div>
        <motion.button
            className="w-full mt-2 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            onClick={addNewIntem}
            >
            + Add Item
        </motion.button>
    </div>
  )
}

export default ProviderHomePage
