import "./reserve.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import useFetch from "../../hooks/useFetch";
import { useContext, useState } from "react";
import { SearchContext } from "../../context/SearchContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SimpleImageSlider from "react-simple-image-slider";

const ReserveModal = ({ setOpen, hotelId }) => {
    const { data, loading, error } = useFetch(
        `https://booknow-com.onrender.com/api/hotels/rooms/${hotelId}`
    );
    const [selectedRooms, setSelectedRooms] = useState([]);
    const { dates } = useContext(SearchContext);

    const getDatesInRange = (startDate, endDate) => {

        const start = new Date(startDate);
        const end = new Date(endDate);
        const date = new Date(start.getTime());
        const dates = [];

        while (date <= end) {
            dates.push(new Date(date).getTime());
            date.setDate(date.getDate() + 1);
        }
        return dates;
    };


    const alldates = getDatesInRange(dates[0].startDate, dates[0].endDate);

    const isAvailable = (roomNumber) => {
        const isFound = roomNumber.unavailableDates.some((date) =>
            alldates.includes(new Date(date).getTime())
        );

        return !isFound;
    };

    const handleSelect = (e) => {
        const isChecked = e.target.checked;
        const value = e.target.value;
        setSelectedRooms(
            isChecked
                ? [...selectedRooms, value]
                : selectedRooms.filter((item) => item !== value)
        );
    };

    const navigate = useNavigate();

    const handleReserve = async () => {
        try {
            await Promise.all(
                selectedRooms.map((roomId) => {
                    const res = axios.put(
                        `https://booknow-com.onrender.com/api/rooms/availability/${roomId}`,
                        {
                            dates: alldates,
                        }
                    );
                    return res.data;
                })
            );
            setOpen(false);
            navigate("/");
        } catch (err) {
            console.log(err);
        }
    };

    console.log("photos", data);
    return (
        <div className="reserve">
            <div className="rContainer">
                <FontAwesomeIcon
                    icon={faCircleXmark}
                    className="rClose"
                    onClick={() => setOpen(false)}
                />
                <span>Select your rooms:</span>
                {data.map((item) => (
                    <div className="rItem" key={item._id}>
                        {/* <img src={item.photos[1]} alt="" /> */}
                        <SimpleImageSlider
                            width={300}
                            height={200}
                            images={item.photos}
                            showBullets={true}
                            showNavs={true}
                        />
                        <div className="rItemInfo">
                            <div className="rTitle">{item.title}</div>
                            <div className="rDesc">{item.desc}</div>
                            <div className="rMax">
                                Max people: <b>{item.maxPeople}</b>
                            </div>
                            <div className="rPrice">{item.price}</div>
                        </div>
                        <div className="rSelectRooms">
                            {item.roomNumbers.map((roomNumber) => (
                                <div className="room">
                                    <label>{roomNumber.number}</label>
                                    <input
                                        type="checkbox"
                                        value={roomNumber._id}
                                        onChange={handleSelect}
                                        disabled={!isAvailable(roomNumber)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <button className="rButton" onClick={handleReserve}>
                    Reserve Now!
                </button>
            </div>
        </div>
    );
};

export default ReserveModal;
