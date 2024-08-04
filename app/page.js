"use client";
import React, { useState, useEffect, useRef } from "react";
import { Camera } from "react-camera-pro";
import { storage, db } from "./firebase"; // Update the import to include storage
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage"; // Import necessary storage functions

export default function Home() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "" });
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [editItemId, setEditItemId] = useState(null);
  const [editItemPrice, setEditItemPrice] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const cameraRef = useRef(null);

  // Add items from database
  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name !== "" && newItem.price !== "") {
      await addDoc(collection(db, "items"), {
        name: newItem.name.trim(),
        price: newItem.price,
      });
      setNewItem({ name: "", price: "" });
    }
  };

  // Read items from database
  useEffect(() => {
    const q = query(collection(db, "items"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr = [];

      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
      });
      setItems(itemsArr);

      // Read total from database
      const calculateTotal = () => {
        const totalPrice = itemsArr.reduce(
          (sum, item) => sum + parseFloat(item.price),
          0
        );
        setTotal(totalPrice);
      };
      calculateTotal();
      return () => unsubscribe();
    });
  }, []);

  // Delete items from database
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, "items", id));
  };

  // Update item price in database
  const updateItemPrice = async (id, newPrice) => {
    const itemDoc = doc(db, "items", id);
    await updateDoc(itemDoc, { price: newPrice });
    setEditItemId(null); // Exit edit mode
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter items based on search query
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle camera toggle
  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  // Capture image and upload to Firebase
  const captureImage = async () => {
    if (cameraRef.current) {
      const image = cameraRef.current.takePhoto();
      const imageRef = ref(storage, `images/${Date.now()}.jpg`);

      try {
        await uploadString(imageRef, image, 'data_url');
        const downloadURL = await getDownloadURL(imageRef);
        console.log("Image uploaded and available at", downloadURL);
        // Add logic to handle the image URL (e.g., save to the database)
      } catch (error) {
        console.error("Error uploading image: ", error);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-4 overflow-hidden">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl p-4 text-center sticky top-0 z-20">
          Pantry Tracker
        </h1>
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={() => setIsCameraOn(false)}
            className="text-white bg-[#0842A1] hover:bg-[#063b8c] p-3 text-sm rounded-lg shadow-lg"
          >
            Pantry Tracker
          </button>
          <button
            onClick={() => setIsCameraOn(true)}
            className="text-white bg-[#0842A1] hover:bg-[#063b8c] p-3 text-sm rounded-lg shadow-lg"
          >
            Camera
          </button>
        </div>

        {!isCameraOn ? (
          <div className="bg-slate-800 p-4 rounded-lg w-full sticky top-16 z-10">
            <form className="grid grid-cols-6 items-center text-black">
              <input
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className="col-span-3 p-3 border rounded-lg"
                type="text"
                placeholder="Enter item"
              />
              <input
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
                className="col-span-2 p-3 border mx-3 rounded-lg"
                type="number"
                placeholder="Quantity"
              />
              <button
                onClick={addItem}
                className="text-white bg-[#0842A1] hover:bg-[#063b8c] p-3 text-sm rounded-lg shadow-lg"
                type="submit"
              >
                Add
              </button>
            </form>
            {items.length > 0 && (
              <input
                value={searchQuery}
                onChange={handleSearchChange}
                className="text-black w-full p-3 border rounded-lg mt-4"
                type="text"
                placeholder="Search items"
              />
            )}
          </div>
        ) : (
          <div className="bg-slate-800 p-4 rounded-lg w-full sticky top-16 z-10 flex flex-col items-center">
            <div className="w-full max-w-lg">
              {typeof window !== 'undefined' && <Camera ref={cameraRef} aspectRatio={16 / 9} />}
            </div>
            <button
              onClick={captureImage}
              className="text-white bg-[#0A621D] hover:bg-[#09571A] p-3 text-sm rounded-lg shadow-lg mt-4"
            >
              Capture Image
            </button>
          </div>
        )}

        {!isCameraOn && items.length > 0 && (
          <div className="overflow-y-auto max-h-[60vh] w-full bg-slate-800 rounded-lg mt-4 p-4">
            <ul>
              {filteredItems.map((item, id) => (
                <li
                  key={id}
                  className="my-3 w-full flex justify-between items-center bg-slate-950 rounded-lg p-4"
                >
                  <div className="flex-1 flex justify-between items-center">
                    <span className="capitalize">{item.name}</span>
                    {editItemId === item.id ? (
                      <input
                        value={editItemPrice}
                        onChange={(e) => setEditItemPrice(e.target.value)}
                        className="p-2 border rounded-lg ml-4 text-black"
                        type="number"
                        placeholder="Enter new price"
                      />
                    ) : (
                      <span className="ml-4">{item.price}</span>
                    )}
                  </div>
                  {editItemId === item.id ? (
                    <button
                      onClick={() => updateItemPrice(item.id, editItemPrice)}
                      className="ml-4 text-white bg-[#0A621D] hover:bg-[#09571A] p-2 rounded-lg"
                    >
                      Update
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditItemId(item.id);
                        setEditItemPrice(item.price);
                      }}
                      className="ml-4 text-white bg-[#0842A1] hover:bg-[#063b8c] p-2 rounded-lg"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="ml-4 text-white bg-[#A10E22] hover:bg-[#8E0C1D] p-2 rounded-lg"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            {items.length < 1 ? (
              ""
            ) : (
              <div className="flex justify-between p-3">
                <span>Total items:</span>
                <span>{total}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
