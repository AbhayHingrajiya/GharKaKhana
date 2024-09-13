import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import axios from "axios";

const ProviderAddItemsForm = () => {
    
    const [isOrderAnyTime, setIsOrderAnyTime] = useState(false);
    const [isDeliveryAnyTime, setIsDeliveryAnyTime] = useState(false);
    const days = ['Everyday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [selectedDays, setSelectedDays] = useState([]);

    const [formData, setFormData] = useState({
        dishName: '',
        address: '',
        dishPrice: '',
        dishQuantity: '',
        orderTill: '',
        deliveryTill: '',
        cityName: '',
        pincode: ''
      });
    const [errors, setErrors] = useState({});

    const addNewItem = () => {

        // Create the container with Tailwind CSS and custom styles
        const formContainer = document.createElement('div');
        formContainer.className = 'flex space-x-4 mt-3 flex-wrap gap-4 custom-form-container';

        // Create and style input for item name
        const itemNameInput = document.createElement('input');
        itemNameInput.type = 'text';
        itemNameInput.placeholder = 'Item Name';
        itemNameInput.name = 'itemName';
        itemNameInput.className = 'flex-grow-[3.5] p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105';

        // Create and style input for item quantity
        const itemQuantityInput = document.createElement('input');
        itemQuantityInput.type = 'text';
        itemQuantityInput.placeholder = 'Item Quantity';
        itemQuantityInput.name = 'itemQuantity';
        itemQuantityInput.className = 'flex-grow-[3.5] p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105';

        // Create and style select for flavor
        const flavorSelect = document.createElement('select');
        flavorSelect.name = 'itemFlavor';
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
    
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
      setErrors({
        ...errors,
        [name]: ''
      });
    };

    const validateForm = () => {
      let formValid = true;
      const newErrors = {};

      if (!formData.dishName) {
        newErrors.dishName = 'Dish Name is required';
        formValid = false;
      }
      if (!formData.address) {
        newErrors.address = 'Address is required';
        formValid = false;
      }
      if (!formData.dishPrice) {
        newErrors.dishPrice = 'Dish Price is required';
        formValid = false;
      }
      if (!formData.deliveryTill && !isDeliveryAnyTime) {
        newErrors.deliveryTill = 'Delivery till time must be specified';
        formValid = false;
      }
      if (!formData.orderTill && !isOrderAnyTime) {
        newErrors.orderTill = 'Order till time must be specified';
        formValid = false;
      }
      if (!formData.cityName) {
        newErrors.cityName = 'City Name is required';
        formValid = false;
      }
      if (!formData.dishQuantity) {
        newErrors.dishQuantity = 'Dish quantity is required';
        formValid = false;
      }
      if (!formData.pincode) {
        newErrors.pincode = 'Pincode is required';
        formValid = false;
      }else if(formData.pincode.length !== 6){
        newErrors.pincode = 'Enter valid Pincode';
        formValid = false;
      }

      setErrors(newErrors);
      return formValid;
    };

    const addDishFormSubmit = async (e) => {
      e.preventDefault();
      
      const itemName = document.getElementsByName('itemName');
      const itemQuantity = document.getElementsByName('itemQuantity');
      const itemFlavor = document.getElementsByName('itemFlavor');

      let itemDetailsArray = [];

      for (let i = 0; i < itemName.length; i++) {
        if(itemName[i].value.trim() == '') continue;
          itemDetailsArray.push({
              itemName: itemName[i].value,
              itemQuantity: itemQuantity[i].value,
              itemFlavor: itemFlavor[i].value
          });
      }
      if (validateForm()) {
        const updatedFormData = {
          ...formData,
          deliveryTill: isDeliveryAnyTime ? 'any' : formData.deliveryTill,
          orderTill: isOrderAnyTime ? 'any' : formData.orderTill,
          items: itemDetailsArray,
          repeat: selectedDays
        };
        setFormData(updatedFormData);
        try{
          let res = await axios.post('/api/addDish', updatedFormData);
          console.log('Dish Added: ' + res);
          alert("Your Dish Added")
          setFormData({
            dishName: '',
            address: '',
            dishPrice: '',
            dishQuantity: '',
            orderTill: '',
            deliveryTill: '',
            cityName: '',
            pincode: ''
          });
          setIsDeliveryAnyTime(false);
          setIsOrderAnyTime(false);
          document.getElementById('itemDetails').innerHTML='';
          setSelectedDays([])
          addNewItem();
        }catch (err){
          console.log('Error in addDish method at frontend side: '+err);
        }
      }
    };

    const getLocation = (e) => {
      e.preventDefault()
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            getAddressFromCoordinates(latitude, longitude);
          },
          (err) => {
            console.log('Error getting location: '+err);
          }
        );
      } else {
        console.log('Geolocation is not supported by this browser.');
      }
    };

    const getAddressFromCoordinates = (lat, lon) => {
      axios
        .get(`https://nominatim.openstreetmap.org/reverse`, {
          params: {
            lat,
            lon,
            format: 'json',
          },
        })
        .then((response) => {
          if (response.data && response.data.display_name) {
            setFormData((prevData) => ({
              ...prevData,
              cityName: response.data.address.city || response.data.address.town || response.data.address.village || '',
              pincode: response.data.address.postcode || '',
              address: response.data.display_name || ''
            }));
      
            // Reset errors
            setErrors((prevErrors) => ({
              ...prevErrors,
              cityName: '',
              pincode: '',
              address: ''
            }));
            console.log(response.data)
          } else {
            console.log('No address found');
          }
        })
        .catch((error) => {
          console.log('Error fetching address: '+error);
        });
    };
      
    const handleCheckboxChange = (day) => {
      if (day === 'Everyday') {
        // If "Everyday" is selected, select all other days
        if (selectedDays.includes('Everyday')) {
          setSelectedDays([]); // Uncheck all if "Everyday" is unchecked
        } else {
          setSelectedDays(days); // Select all days if "Everyday" is checked
        }
      } else {
        // Handle individual day selection
        const newSelectedDays = selectedDays.includes(day)
          ? selectedDays.filter((d) => d !== day) // Deselect the clicked day
          : [...selectedDays, day]; // Select the clicked day
  
        // If all individual days are selected, select "Everyday"
        if (newSelectedDays.length === days.length - 1 && !newSelectedDays.includes('Everyday')) {
          newSelectedDays.push('Everyday');
        } else if (newSelectedDays.includes('Everyday')) {
          newSelectedDays.splice(newSelectedDays.indexOf('Everyday'), 1); // Remove "Everyday" if a day is deselected
        }
  
        setSelectedDays(newSelectedDays);
      }
    };

  return (
    <div>
      <form className="space-y-8 p-8 bg-white shadow-lg rounded-lg" onSubmit={addDishFormSubmit}>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <motion.div
            className="flex-grow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-700">Dish Name</label>
            <motion.input
              type="text"
              name="dishName"
              placeholder="Enter dish name"
              value={formData.dishName}
              onChange={handleInputChange}
              className={`w-full p-3 border ${errors.dishName ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105`}
              whileFocus={{ scale: 1.05 }}
            />
            {errors.dishName && <span className="text-red-500 text-sm">{errors.dishName}</span>}
          </motion.div>

          <motion.div
            className="flex-grow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-700">Dish Quantity</label>
            <motion.input
              type="number"
              name="dishQuantity"
              placeholder="Enter Dish Quantity"
              value={formData.dishQuantity}
              onChange={handleInputChange}
              className={`w-full p-3 border ${errors.dishQuantity ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105`}
              whileFocus={{ scale: 1.05 }}
            />
            {errors.dishQuantity && <span className="text-red-500 text-sm">{errors.dishQuantity}</span>}
          </motion.div>

          <motion.div
            className="flex-grow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-700">Dish Price</label>
            <motion.input
              type="number"
              name="dishPrice"
              placeholder="Enter price"
              value={formData.dishPrice}
              onChange={handleInputChange}
              className={`w-full p-3 border ${errors.dishPrice ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105`}
              whileFocus={{ scale: 1.05 }}
            />
            {errors.dishPrice && <span className="text-red-500 text-sm">{errors.dishPrice}</span>}
          </motion.div>
        </div>

          <div className="flex space-x-4">
              <div className="flex-grow space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <label className="block text-sm font-medium text-gray-700">Order Till</label>
                    <motion.input
                    type="time"
                    name='orderTill'
                    value={formData.orderTill}
                    onChange={handleInputChange}
                    disabled={isOrderAnyTime}
                    className={`w-full p-3 border ${errors.orderTill ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105`}
                    whileFocus={{ scale: 1.05 }}
                    />
                    <div className="flex items-center mt-2">
                      <motion.input
                          type="checkbox"
                          checked={isOrderAnyTime}
                          onChange={() => setIsOrderAnyTime(!isOrderAnyTime)}
                          className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">Any time</label>
                      {errors.orderTill && <span className="text-red-500 pl-2 text-sm">{errors.orderTill}</span>}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <label className="block text-sm font-medium text-gray-700">Delivery Till</label>
                    <motion.input
                    type="time"
                    name='deliveryTill'
                    value={formData.deliveryTill}
                    onChange={handleInputChange}
                    disabled={isDeliveryAnyTime}
                    className={`w-full p-3 border ${errors.deliveryTill ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105`}
                    whileFocus={{ scale: 1.05 }}
                    />
                    <div className="flex items-center mt-2">
                      <motion.input
                          type="checkbox"
                          checked={isDeliveryAnyTime}
                          onChange={() => setIsDeliveryAnyTime(!isDeliveryAnyTime)}
                          className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">Any time</label>
                      {errors.deliveryTill && <span className="text-red-500 pl-2 text-sm">{errors.deliveryTill}</span>}
                    </div>
                </motion.div>
              </div>

              <motion.div
              className="flex-grow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              >
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <motion.textarea
                  placeholder="Enter address"
                  name='address'
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full h-[10.5rem] p-3 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105`}
                  whileFocus={{ scale: 1.05 }}
              />
              {errors.address && <span className="text-red-500 text-sm">{errors.address}</span>}
              </motion.div>
            </div>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <motion.div
                className="flex-grow-[3.5]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700">Your Address</label>
                <button
                  onClick={getLocation}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-md bg-blue-500 text-white focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Get Your Address
                </button>
              </motion.div>

              <motion.div
                className="flex-grow-[3.5]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700">City Name</label>
                <motion.input
                  type="text"
                  name="cityName"
                  placeholder="Enter city name"
                  value={formData.cityName}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${errors.cityName ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105`}
                  whileFocus={{ scale: 1.05 }}
                />
                {errors.cityName && <span className="text-red-500 text-sm">{errors.cityName}</span>}
              </motion.div>

              <motion.div
                className="flex-grow-[3]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <motion.input
                  type="number"
                  name="pincode"
                  placeholder="Enter pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className={`w-full p-3 border ${errors.pincode ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105`}
                  whileFocus={{ scale: 1.05 }}
                />
                {errors.pincode && <span className="text-red-500 text-sm">{errors.pincode}</span>}
              </motion.div>
            </div>
  
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
                    name="itemName"
                    className="flex-grow-[3.5] p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
                    whileFocus={{ scale: 1.05 }}
                />
                <motion.input
                    type="text"
                    placeholder="Item Quantity"
                    name="itemQuantity"
                    className="flex-grow-[3.5] p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
                    whileFocus={{ scale: 1.05 }}
                />
                <motion.select
                    className="flex-grow-[3] p-3 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
                    whileFocus={{ scale: 1.05 }}
                    name="itemFlavor"
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
              onClick={(e) => {
                  e.preventDefault(); // Prevent the form from submitting and reloading the page
                  addNewItem();
              }}
              >
              + Add Item
          </motion.button>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Can you repeat the order?</h3>
          </div>

          <div className="flex flex-wrap gap-4">
            {days.map((day, index) => (
              <motion.label
                key={index}
                className="flex items-center space-x-2 cursor-pointer"
                whileHover={{ scale: 1.1, color: '#059669' }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-green-600"
                  onChange={() => handleCheckboxChange(day)}
                  checked={selectedDays.includes(day)} // Keeps checkbox state in sync with selectedDays
                />
                <span>{day}</span>
              </motion.label>
            ))}
          </div>

          <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
          >
              <motion.button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-110 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              whileHover={{ scale: 1.1 }}
              >
              Submit
              </motion.button>
          </motion.div>
        </form>
    </div>
  )
}

export default ProviderAddItemsForm
