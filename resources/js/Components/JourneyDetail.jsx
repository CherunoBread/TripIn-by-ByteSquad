import { format } from "date-fns";
import { useState } from "react";
import axios from "axios";

const JourneyDot = () => {
    return (
        <>
            <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-black" />
                <div className="w-0.5 h-24 bg-black" />
                <div className="w-2.5 h-2.5 rounded-full bg-black" />
            </div>
        </>
    );
};

const JourneyDetail = ({ routes, booking }) => {
    const [selectedRoute, setSelectedRoute] = useState("");
    console.log("Routes : ", routes);

    const onClickDetail = async (e, routeId, plate, departure) => {
        e.preventDefault();
        const csrfToken = document.head.querySelector(
            'meta[name="csrf-token"]'
        ).content;

        try {
            const response = await axios.post(
                route("route.store"),
                {
                    selectedRoute: { routeId, plate, departure },
                },
                {
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                    },
                }
            );

            if (response.status == 200) {
                window.location.href = "/booking/seat";
            }
        } catch (error) {
            if (error.response) {
                // The request was made, and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Server Error:", error.response.data);
                alert(
                    error.response.data.message ||
                        "An error occurred on the server."
                );
            } else if (error.request) {
                // The request was made, but no response was received
                console.error("Network Error:", error.request);
                alert(
                    "Network error. Please check your internet connection and try again."
                );
            } else {
                // Something happened in setting up the request that triggered an error
                console.error("Error:", error.message);
                alert("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <>
            {routes.map((bus) =>
                bus.vehicles.map((vehicle) => (
                    <div
                        key={vehicle.pivot.route_id} // Use route_id from the pivot
                        className="bg-white rounded-lg shadow-md p-4 relative cursor-pointer"
                        onClick={(e) =>
                            onClickDetail(
                                e,
                                vehicle.pivot.route_id,
                                vehicle.license_plate,
                                vehicle.pivot.departure_time
                            )
                        }
                    >
                        {/* Available Seats Badge */}
                        <div className="absolute top-4 right-4 text-blue-600 px-2 py-1 rounded-full text-xs">
                            {vehicle.seats} Seats Available
                        </div>

                        {/* Bus Details */}
                        <div className="flex items-center space-x-4">
                            <img
                                src="/Shuttle_Icon.svg"
                                alt="Bus"
                                className="w-16 h-16 rounded-md object-cover"
                            />
                            <div className="flex-grow">
                                <h2 className="font-semibold text-sm">
                                    Shuttle Bus TripIn
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {vehicle.license_plate}
                                </p>
                            </div>
                        </div>

                        {/* Journey Details */}
                        <div className="mt-4">
                            <div className="flex items-center space-x-4 ml-20">
                                <div className="flex items-start h-full">
                                    <JourneyDot />
                                </div>
                                <div className="flex-1">
                                    <div className="items-center mt-6">
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                {format(
                                                    booking.selectedDay,
                                                    "MMMM d, yyyy"
                                                )}
                                            </p>
                                            <div className="flex items-center space-x-2 text-sm">
                                                <span className="font-semibold">
                                                    from: {booking.origin}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs">
                                            {vehicle.pivot.departure_time
                                                .split(":")
                                                .slice(0, 2)
                                                .join(":")}
                                        </span>
                                        <div className="mt-4">
                                            <div className="flex items-center space-x-2 text-sm">
                                                <span className="font-semibold">
                                                    to: {bus.name}
                                                </span>
                                            </div>
                                            <span className="text-xs">
                                                {vehicle.pivot.arrival_time
                                                    .split(":")
                                                    .slice(0, 2)
                                                    .join(":")}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <div className="flex items-center space-x-2 text-xs text-gray-400"></div>
                                        <p className="text-blue-600 font-semibold">
                                            {new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                                minimumFractionDigits: 0,
                                            }).format(vehicle.pivot.price)}
                                            /pax
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </>
    );
};

export default JourneyDetail;
