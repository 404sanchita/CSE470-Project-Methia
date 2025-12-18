import React, { useState, useMemo } from "react";
import axios from "axios";

const BookingSummary = ({ booking, onEdit, onDelete }) => {
  const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="max-w-3xl mx-auto border-2 border-green-300 p-8 rounded-xl bg-white shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-6 text-green-700 flex items-center gap-3 border-b pb-3">
        Booking Confirmed!
      </h2>

      <div className="space-y-5 text-gray-700">
        <div className="bg-green-50 p-5 rounded-lg border border-green-200">
          <h3 className="font-bold text-xl mb-3 text-green-800">Guide Details</h3>
          <p><strong>Name:</strong> {booking.guideName}</p>
          <p><strong>Specialties:</strong> {booking.guide?.specialties?.join(", ") || "General"}</p>
          <p><strong>Contact:</strong> {booking.guide?.email || "N/A"}</p>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="font-bold text-xl mb-3 text-gray-800">Trip Details</h3>
          <p><strong>Destination:</strong> {booking.destination}</p>
          <p><strong>Traveler Name:</strong> {booking.userName}</p>
          <p><strong>Date:</strong> {formattedDate}</p>
          <p><strong>Time:</strong> {booking.startTime} – {booking.endTime}</p>
          <p className="text-2xl font-bold mt-4 text-green-600">
            <strong>Total Cost:</strong> {booking.totalCost}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <button
          onClick={onEdit}
          className="bg-yellow-500 text-white px-8 py-3 rounded-lg hover:bg-yellow-600 transition font-semibold shadow-md"
        >
          Modify Time
        </button>
        <button
          onClick={onDelete}
          className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition font-semibold shadow-md"
        >
          Cancel Trip
        </button>
      </div>
    </div>
  );
};

const GuideBooking = () => {
  const destinations = [
    "Paris", "Kyoto", "Bali", "New York City", "Rome", "London", "Dubai",
  ];

  const [step, setStep] = useState(1); 
  
  const [selectedDestination, setSelectedDestination] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [filterExperience, setFilterExperience] = useState(""); 

  const [guides, setGuides] = useState([]); 

 
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [userName, setUserName] = useState("");
  const [bookingInfo, setBookingInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");

 
  const [message, setMessage] = useState("");
  const [ratings, setRatings] = useState({}); 
  const [isLoading, setIsLoading] = useState(false);


  const fetchGuidesByDestination = async (destination) => {
    setMessage("");
    setGuides([]);
    setSelectedGuide(null);
    if (!destination) return;

    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/guides/${destination}`);
      setGuides(res.data);
      setStep(1); 
      if (res.data.length === 0) {
        setMessage(`No guides found for ${destination}.`);
      }
    } catch {
      setMessage("Could not fetch guides. Check the backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDestinationChange = (e) => {
    const dest = e.target.value;
    setSelectedDestination(dest);
    
    
    setFilterName("");
    setFilterSpecialty("");
    setFilterLanguage("");
    setFilterExperience("");

    fetchGuidesByDestination(dest);
  };

  
  const filteredGuides = useMemo(() => {
    
    
    if (
      !filterName &&
      !filterSpecialty &&
      !filterLanguage &&
      !filterExperience
    ) {
      return guides;
    }

    
    return guides.filter((g) => {

  
      const matchName = filterName
        ? g.name.toLowerCase().includes(filterName.toLowerCase())
        : true;

  
      const matchSpecialty = filterSpecialty
        ? g.specialties?.some(s => s.toLowerCase().includes(filterSpecialty.toLowerCase()))
        : true;

     
      const matchLanguage = filterLanguage
        ? g.language?.some(l => l.toLowerCase().includes(filterLanguage.toLowerCase()))
        : true;

      
      let matchExperience = true;

      if (filterExperience) {
        
        const guideExperienceYears = parseInt(g.experience); 
        const minFilterYears = parseInt(filterExperience); 

        if (!isNaN(guideExperienceYears) && !isNaN(minFilterYears)) {
         
          matchExperience = guideExperienceYears >= minFilterYears; 
        } else {
        
          matchExperience = false; 
        }
      }

     
      return matchName && matchSpecialty && matchLanguage && matchExperience;
    });
  }, [guides, filterName, filterSpecialty, filterLanguage, filterExperience]);



  const handleSelectGuide = (guide) => {
    setSelectedGuide(guide);
    setStep(2); 
    setMessage("");
  };

  const handleRate = (guideId, type) => {
    setRatings((prev) => {
      const current = prev[guideId] || { likes: 0, dislikes: 0 };
      return {
        ...prev,
        [guideId]: {
          ...current,
          [type]: current[type] + 1,
        },
      };
    });
  };


  const handleBook = async () => {
    if (!selectedGuide || !date || !startTime || !endTime || !userName) {
      setMessage("Please fill all fields correctly.");
      return;
    }

    setMessage("Processing booking...");

    try {
      const res = await axios.post("http://localhost:5000/api/guides/book", {
        guideId: selectedGuide._id,
        destination: selectedDestination,
        userName,
        date,
        startTime,
        endTime,
      });

      setBookingInfo({
        ...res.data.booking,
        guideName: selectedGuide.name,
        guide: selectedGuide,
      });

      setMessage("Booking successful!");
      setStep(3); 
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setMessage("This time slot is already booked! Please choose another time.");
      } else {
        setMessage(err.response?.data?.message || "Booking failed. Try again.");
      }
    }
  };

  
  const handleUpdateClick = () => {
    setEditDate(new Date(bookingInfo.date).toISOString().split("T")[0]);
    setEditStartTime(bookingInfo.startTime);
    setEditEndTime(bookingInfo.endTime);
    setIsEditing(true);
    setMessage("");
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/guides/book/${bookingInfo._id}`,
        {
          date: editDate,
          startTime: editStartTime,
          endTime: editEndTime,
        }
      );
      setBookingInfo({ ...bookingInfo, ...res.data.booking });
      setIsEditing(false);
      setMessage("Booking updated successfully!");
    } catch (err) {
       if (err.response && err.response.status === 409) {
        setMessage("Update failed: Slot overlap detected.");
      } else {
        setMessage("Update failed.");
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/guides/book/${bookingInfo._id}`);
      setBookingInfo(null);
      setStep(1); 
      setSelectedDestination("");
      setGuides([]);
      setUserName("");
      setMessage("Booking cancelled.");
    } catch {
      setMessage("Error cancelling booking.");
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl p-6 md:p-10">
        
        <header className="text-center mb-10 border-b border-gray-200 pb-6">
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">
                Find Your Local Travel Expert
            </h1>
            <p className="text-lg text-gray-500 mt-2">
                Discover the best local guides for your next adventure.
            </p>
        </header>

  
       

       
        {step === 1 && !bookingInfo && (
          <>
           
            <div className="bg-white p-6 rounded-lg mb-8 border border-gray-300 shadow-lg">
              <label className="block mb-3 font-extrabold text-lg text-gray-700">1. Select Your Destination</label>
              <select
                className="border-2 border-gray-300 p-3 w-full rounded-lg focus:border-blue-500 outline-none transition text-base"
                value={selectedDestination}
                onChange={handleDestinationChange}
              >
                <option value="">-- Choose a City to explore guides --</option>
                {destinations.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            
            {selectedDestination && guides.length > 0 && (
              <div className="bg-blue-50 p-6 rounded-xl mb-10 border border-blue-200 shadow-inner animate-fadeIn">
                  <h2 className="text-xl font-bold mb-5 text-blue-800 border-b border-blue-200 pb-2">2. Filter Guides (Optional)</h2>
                 
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      
                    
                      <div className="flex flex-col">
                          <label className="text-sm font-medium mb-1 text-gray-600">Guide Name</label>
                          <input 
                              type="text" 
                              placeholder="e.g. Elena"
                              className="border p-3 rounded-lg focus:border-blue-400 outline-none transition"
                              value={filterName}
                              onChange={(e) => setFilterName(e.target.value)}
                          />
                      </div>

                      
                      <div className="flex flex-col">
                          <label className="text-sm font-medium mb-1 text-gray-600">Specialty</label>
                          <input 
                              type="text" 
                              placeholder="e.g. Museums, Hikes"
                              className="border p-3 rounded-lg focus:border-blue-400 outline-none transition"
                              value={filterSpecialty}
                              onChange={(e) => setFilterSpecialty(e.target.value)}
                          />
                      </div>

                  
                      <div className="flex flex-col">
                          <label className="text-sm font-medium mb-1 text-gray-600">Language</label>
                          <input 
                              type="text" 
                              placeholder="e.g. Spanish"
                              className="border p-3 rounded-lg focus:border-blue-400 outline-none transition"
                              value={filterLanguage}
                              onChange={(e) => setFilterLanguage(e.target.value)}
                          />
                      </div>

                    
                      <div className="flex flex-col">
                          <label className="text-sm font-medium mb-1 text-gray-600">Min. Experience (Years)</label>
                          <input 
                              type="number" 
                              placeholder="e.g. 3"
                              className="border p-3 rounded-lg focus:border-blue-400 outline-none transition"
                              value={filterExperience}
                              onChange={(e) => setFilterExperience(e.target.value)}
                          />
                      </div>
                  </div>
              </div>
            )}

       
            <div className="animate-fadeIn">
              {isLoading && (
                   <p className="text-center text-blue-600 font-medium my-12 text-lg">Loading amazing guides in {selectedDestination}...</p>
              )}

              {!isLoading && guides.length > 0 && (
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">
                      Available Guides in {selectedDestination} ({filteredGuides.length} found)
                  </h3>
              )}
              
              {!isLoading && selectedDestination && guides.length > 0 && filteredGuides.length === 0 && (
                   <p className="text-center text-xl text-red-600 font-medium my-12 p-4 bg-red-50 rounded-lg">
                    No guides matched your current filters. Try relaxing your criteria.
                  </p>
              )}

              {!isLoading && filteredGuides.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredGuides.map((g) => {
                          const guideRating = ratings[g._id] || { likes: 0, dislikes: 0 };
                          
                          return (
                          <div
                              key={g._id}
                              onClick={() => handleSelectGuide(g)}
                              className="bg-white border border-gray-200 p-6 rounded-xl hover:shadow-2xl cursor-pointer transition transform hover:-translate-y-1 relative"
                          >
                              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-400 transition duration-300 pointer-events-none"></div>

                              <div className="flex flex-col h-full">
                                  <div className="flex justify-between items-center mb-4 border-b pb-3">
                                      <h3 className="text-2xl font-extrabold text-gray-900">{g.name}</h3>
                                      <span className="text-lg font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                          {g.hourlyRate}/hr
                                      </span>
                                  </div>
                                  
                                  <p className="text-gray-500 mb-4 flex-grow">
                                      {g.experience} Years of local guiding experience.
                                  </p>

                                  <div className="mt-auto pt-3 border-t flex justify-between items-center">
                                      <div className="flex gap-4 text-sm text-gray-600">
                                          <span className="flex items-center gap-1">
                                              👍 <span className="font-bold text-green-700">{guideRating.likes}</span>
                                          </span>
                                          <span className="flex items-center gap-1">
                                              👎 <span className="font-bold text-red-700">{guideRating.dislikes}</span>
                                          </span>
                                      </div>
                                      <button className="text-blue-600 font-semibold hover:text-blue-800 transition text-sm">
                                          View Profile →
                                      </button>
                                  </div>
                              </div>
                          </div>
                          )
                      })}
                  </div>
              )}
            </div>
          </>
        )}

        {step === 2 && selectedGuide && !bookingInfo && (
          <div className="animate-fadeIn bg-white rounded-xl shadow-2xl border border-gray-200">
            <button 
              onClick={() => setStep(1)}
              className="mt-4 ml-6 text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-semibold transition"
            >
              ← Back to Guide List
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-gray-200 mt-4">
             
              <div className="lg:col-span-1 bg-gray-50 p-8">
                  <div className="text-center mb-8">
                      
                      <div className="w-28 h-28 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl font-extrabold text-white border-4 border-blue-200 shadow-lg">
                          {selectedGuide.name[0]}
                      </div>
                      <h2 className="text-3xl font-extrabold text-gray-900 mb-1">{selectedGuide.name}</h2>
                      <p className="text-xl font-semibold text-green-600">{selectedGuide.hourlyRate}/hr</p>
                      <p className="text-md text-gray-500 mt-1">
                          <span className="font-bold">{selectedGuide.experience}</span> Years of Experience
                      </p>
                  </div>

                  <hr className="my-6 border-gray-200" />
                  
             
                  <div className="space-y-6">
                   <div>
                    <h4 className="font-bold text-gray-700 mb-2 uppercase text-sm tracking-wider">
                           Languages Spoken
                    </h4>
                
                     <div className="text-gray-800 text-base">
                             {(selectedGuide.language && selectedGuide.language.length) 
                                   ? selectedGuide.language.join(', ')  : <span className="text-gray-500 italic">N/A</span>}
                     </div>
                  </div>

                      <div>
                          <h4 className="font-bold text-gray-700 mb-2 uppercase text-sm tracking-wider">
                              Specialties
                          </h4>
                      
                          <p className="text-gray-600">
                              {selectedGuide.specialties?.join(", ") || "General Guidance"}
                          </p>
                      </div>
                  </div>

                  <hr className="my-6 border-gray-200" />

                 
                  <div className="space-y-4">
                      <h4 className="font-bold text-gray-700 uppercase text-sm tracking-wider">Rate This Guide</h4>
                      <div className="flex gap-4">
                          <button 
                              onClick={() => handleRate(selectedGuide._id, 'likes')}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition shadow-md flex justify-between items-center px-4"
                          >
                              <span>👍 Like</span>
                              <span className="bg-white text-green-700 px-3 rounded-full font-extrabold text-sm">{ratings[selectedGuide._id]?.likes || 0}</span>
                          </button>
                          <button 
                              onClick={() => handleRate(selectedGuide._id, 'dislikes')}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition shadow-md flex justify-between items-center px-4"
                          >
                               <span>👎 Dislike</span>
                               <span className="bg-white text-red-700 px-3 rounded-full font-extrabold text-sm">{ratings[selectedGuide._id]?.dislikes || 0}</span>
                          </button>
                      </div>
                  </div>
              </div>

         
              <div className="lg:col-span-2 p-8">
                  <h3 className="text-2xl font-extrabold mb-6 text-blue-800">Ready to Book?</h3>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Your Full Name</label>
                          <input
                              className="border p-3 w-full rounded-lg focus:ring-4 ring-blue-100 focus:border-blue-500 outline-none transition shadow-sm"
                              placeholder="e.g. Sarah Smith"
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                          />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                              <input
                                  type="date"
                                  className="border p-3 w-full rounded-lg focus:ring-4 ring-blue-100 focus:border-blue-500 outline-none shadow-sm"
                                  value={date}
                                  onChange={(e) => setDate(e.target.value)}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                              <input
                                  type="time"
                                  className="border p-3 w-full rounded-lg focus:ring-4 ring-blue-100 focus:border-blue-500 outline-none shadow-sm"
                                  value={startTime}
                                  onChange={(e) => setStartTime(e.target.value)}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                              <input
                                  type="time"
                                  className="border p-3 w-full rounded-lg focus:ring-4 ring-blue-100 focus:border-blue-500 outline-none shadow-sm"
                                  value={endTime}
                                  onChange={(e) => setEndTime(e.target.value)}
                              />
                          </div>
                      </div>
                      
                      <div className="pt-4">
                          <button
                              onClick={handleBook}
                              className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition shadow-xl text-lg disabled:opacity-50"
                              disabled={!date || !startTime || !endTime || !userName}
                          >
                              Book {selectedGuide.name} Now
                          </button>
                      </div>
                      <p className="text-center text-sm text-gray-500 mt-4">
                        Booking time slots are subject to availability.
                      </p>
                  </div>
              </div>
            </div>
          </div>
        )}

       
        {bookingInfo && !isEditing && (
          <BookingSummary
            booking={bookingInfo}
            onEdit={handleUpdateClick}
            onDelete={handleDelete}
          />
        )}

        {bookingInfo && isEditing && (
          <div className="max-w-xl mx-auto border-2 border-yellow-400 p-8 rounded-xl bg-yellow-50 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-yellow-800 border-b pb-3">Update Your Booking</h2>
            <div className="space-y-5">
              <input
                  type="date"
                  className="border p-3 w-full rounded-lg focus:ring-2 ring-yellow-200 outline-none shadow-sm"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
              />
              <div className="flex gap-4">
                  <input
                      type="time"
                      className="border p-3 w-full rounded-lg focus:ring-2 ring-yellow-200 outline-none shadow-sm"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                  />
                  <input
                      type="time"
                      className="border p-3 w-full rounded-lg focus:ring-2 ring-yellow-200 outline-none shadow-sm"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                  />
              </div>
              <div className="flex gap-4 pt-2">
                  <button
                      onClick={handleUpdate}
                      className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-bold transition shadow-md"
                  >
                      Save Changes
                  </button>
                  <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 font-bold transition shadow-md"
                  >
                      Cancel
                  </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GuideBooking;
