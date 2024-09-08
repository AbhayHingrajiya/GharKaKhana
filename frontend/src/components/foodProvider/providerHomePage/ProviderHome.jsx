import React, { useState } from "react";
import ProviderNavbar from '../providerNavbar/ProviderNavbar'
import test from '../../../assets/test.jpg'
import { motion } from 'framer-motion';
import ProviderAddItemsForm from '../providerAddItemsForm/ProviderAddItemsForm'

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

  return (
    <div>
        <ProviderNavbar />
        <div className='p-8'>
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

            <ProviderAddItemsForm />
        
        </div>
    </div>
  )
}

export default ProviderHomePage
