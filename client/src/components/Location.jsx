import React, { useState, useEffect } from 'react';
import { IoMdClose } from "react-icons/io";


const Location = () => {
    const [showModal, setShowModal] = useState(false);
    const [address, setAddress] = useState("Indore, India"); // Default or fetched from store
    const [loading, setLoading] = useState(false);

    const handleLocationDetect = async () => {
        setLoading(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Using OpenStreetMap Nominatim API for demo purposes
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    const data = await response.json()
                    setAddress(data.display_name.split(',')[0] + ", " + data.display_name.split(',')[1])
                } catch (err) {
                    setAddress(`${latitude}, ${longitude}`)
                }
                setLoading(false);
                setShowModal(false);
            }, (error) => {
                console.error("Error detecting location", error);
                setLoading(false);
                // Fallback or toast
            });
        } else {
            alert("Geolocation not supported");
            setLoading(false);
        }
    }

    return (
        <div className='lg:flex hidden flex-col justify-center items-start gap-1 max-w-[200px] cursor-pointer select-none group' onClick={() => setShowModal(true)}>
            <div className='flex flex-col gap-1'>
                <p className='text-xs font-bold leading-none'>Delivery in 8 minutes</p>
                <div className='flex items-center gap-1 max-w-[150px]'>
                    <p className='truncate text-sm font-normal text-neutral-600 group-hover:text-black line-clamp-1'>{address}</p>
                    {/* Simple dropdown arrow */}
                    <span className='group-hover:rotate-180 transition-all duration-300'>▼</span>
                </div>
            </div>

            {showModal && (
                <div className='fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4' onClick={(e) => { e.stopPropagation(); setShowModal(false); }}>
                    <div className='bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative animate-in fade-in zoom-in duration-200' onClick={(e) => e.stopPropagation()}>
                        <div className='flex justify-between items-center mb-6'>
                            <h2 className='text-xl font-bold text-gray-800'>Change Location</h2>
                            <button onClick={() => setShowModal(false)} className='text-gray-500 hover:text-black'><IoMdClose size={24} /></button>
                        </div>

                        <button
                            className='w-full bg-green-600 text-white font-semibold py-3 rounded-lg flex justify-center items-center px-4 hover:bg-green-700 transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed'
                            onClick={handleLocationDetect}
                            disabled={loading}
                        >
                            <span>{loading ? "Detecting..." : "Detect my location"}</span>
                        </button>

                        <div className='flex items-center gap-4 my-6'>
                            <div className='h-[1px] bg-gray-200 w-full'></div>
                            <span className='text-gray-400 uppercase text-xs font-medium'>OR</span>
                            <div className='h-[1px] bg-gray-200 w-full'></div>
                        </div>

                        <div className='bg-gray-50 p-3 rounded-lg flex items-center gap-2 border border-gray-200 focus-within:border-gray-400 transition-colors'>
                            <input type="text" placeholder='Search delivery location' className='bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-400' />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Location;
