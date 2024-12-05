<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Driver;
use App\Models\Location;
use App\Models\Payment;
use App\Models\Schedule;
use App\Models\SeatBooking;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log as FacadesLog;
use Midtrans\Config;
use Midtrans\Snap;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        Config::$clientKey = env('MIDTRANS_CLIENT_KEY');
        Config::$isProduction = false;
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    // Menampilkan halaman Detail Order
    public function OrderDetailsIndex(){
        $routeId = session('setRoute.selectedRoute.routeId');
        $user = Auth::user();
        $seatNumber = session('seatNumber');
        $data = Location::whereHas('vehicles', function($query) use ($routeId) {
            $query->where('route_id', $routeId);
                })->with(['vehicles' => function($query) use ($routeId) {
                    $query->withPivot('route_id')->where('route_id', $routeId);
                }])->get();

        return Inertia::render('Booking/OrderDetails', [
            'routeData' => $data, 
            'bookingData' => session('bookingData'),
            'user' => $user,
            'seatNumber' => $seatNumber,
            'seatCount' => session('seatCount'),
        ]);
    }

    public function seatIndex(){
        $seatLimit = session('bookingData.seatsValue');
        $plate = session('setRoute');

        return Inertia::render('Booking/SelectSeat', ['plate' => $plate, 'seatLimit' => $seatLimit]);
    }

    public function paymentStatusIndex(){
        return Inertia::render('Booking/PaymentStatus');
    }

    public function paymentTermsIndex(){
        return Inertia::render('Booking/PaymentTerms');
    }

    public function boardingTicketIndex(){
        return Inertia::render('Booking/BoardingTicket');
    }

    public function busScheduleIndex()
    {
        $city = session('bookingData.cityValue');

        // Fetch locations with associated vehicles and pivot data
        $routes = Location::with(['vehicles' => function($query) {
                $query->withPivot('price', 'route_id', 'departure_time', 'arrival_time'); 
            }])
            ->where('city', $city)
            ->where("name", '!=', session('bookingData.origin'))
            ->get();

        // Return the filtered data to the Inertia frontend
        return Inertia::render('Booking/BusSchedule', [
            'booking' => session('bookingData'),
            'routes' => $routes,
        ]);
    }

    public function destinationIndex(){
        return Inertia::render('Booking/Destination');
    }

    public function bookingIndex(){
        $location = Location::all();
        $driver = Driver::where('driver_id', 1)->with('vehicle')->first();
        $routes = Vehicle::with('locations')->where('vehicle_id', 1)->first();
        
        return Inertia::render('Booking/Booking', ['location' => $location, 'driver' => $driver, 'routes' => $routes]);
    }

    public function originIndex(){

        return Inertia::render('Booking/Origin');
    }

    public function bookingStore(Request $request){
        $bookingData = $request->validate([
            'cityValue' => 'required',
            'origin' => 'required',
            'selectedDay' => 'required',
            'seatsValue' => 'required'
        ]);

        session(['bookingData' => $bookingData]);

        return response()->json(['message' => 'Booking stored successfully']);
    }

    public function routeStore(Request $request){
        $route = $request->validate([
            'selectedRoute' => 'required',
            'selectedRoute.routeId' => 'required',
            'selectedRoute.plate' => 'required',
            'selectedRoute.departure' => 'required',
        ]);

        session(['setRoute' => $route]);

        return response()->json(['message' => 'Route stored successfully']);
    }

    public function fetchBookedSeats($licensePlate) {
        $date = session('bookingData.selectedDay');
        $formattedDate = date('Y-m-d', strtotime($date)); // Format to Y-m-d if necessary

        // Find the vehicle by its license plate
        $vehicle = Vehicle::where('license_plate', $licensePlate)->first();

        $departureTime = session('setRoute.selectedRoute.departure'); // You can also pass this as a parameter if needed

        if (!$vehicle) {
            return response()->json(['message' => 'Vehicle not found'], 404);
        }

        try{
            $bookedSeats = SeatBooking::where('vehicle_id', $vehicle->vehicle_id)
                ->where('departure_time', $departureTime) // Optional: Filter by departure time if needed
                ->where('departure_date', $formattedDate)
                ->pluck('seat_number') // Get the seat_number column
                ->toArray();

            $flattenedBookedSeats = [];
            foreach ($bookedSeats as $seats) {
                $flattenedBookedSeats = array_merge($flattenedBookedSeats, $seats);
            }
            // Return the booked seats
            return response()->json(['booked_seats' => $flattenedBookedSeats]);
        } catch(\Exception $e) {
            FacadesLog::info("Error on try block : " . $e->getMessage());

            return response()->json(['message' => 'An error occurred. Please try again later']);
        }
    }

    public function storeData(Request $request){
        $routeId = session('setRoute.selectedRoute.routeId');
        $vehicle = session('vehicle');

        $location = Location::whereHas('vehicles', function($query) use ($routeId) {
            $query->where('route_id', $routeId);
                })->with(['vehicles' => function($query) use ($routeId) {
                    $query->withPivot('route_id')->where('route_id', $routeId);
                }])->first();

        $user = Auth::user();
        FacadesLog::info('User : ' . $user);

        $transaction_details = [
            'order_id' => uniqid(),
            'gross_amount' => $request->amount,
        ];

        $item_details = [
            [
                'id' => $location->vehicles[0]->pivot->route_id,
                'price' => $location->vehicles[0]->pivot->price,
                'quantity' => session('seatCount'),
                'name' => 'Gopay Payment' 
            ]
        ];

        $billing_address = [
            'first_name' => $user->username,
            'phone' => $user->phone_number,
            'country_code' => 'IDN',
        ];

        $customer_details = [
            'first_name' => $user->username,
            'email' => $user->email,
            'phone' => $user->phone_number,
            'biling_address' => $billing_address,
        ];

        $transaction_data = [
            'transaction_details' => $transaction_details,
            'item_details' => $item_details,
            'customer_details' => $customer_details,
            'callbacks' => [
                'finish' => route('home'), // Route where you want to redirect the user
            ],
        ];

        try{
            $snap_token = Snap::getSnapToken($transaction_data);

            session(['temp_booking' => [
                'amount' => $request->amount,
                'user_id' => $user->user_id,
                'seat_count' => session('seatCount'),
                'vehicle_id' => $vehicle->vehicle_id,
                'location_id' => $location->location_id,
                'departure_time' => session('setRoute.selectedRoute.departure'),
                'departure_date' => date('Y-m-d', strtotime(session('bookingData.selectedDay'))),
                'seat_number' => session('seatNumber'),
                'route_id' => $routeId,
                'city_value' => session('bookingData.cityValue'),
            ]]);

            return response()->json(['snap_token' => $snap_token]);

        } catch (\Exception $e){
            FacadesLog::info('Error Inserting on DB : ' . $e->getMessage());

            return response()->json(['message', 'Something wrong, please try again later']);
        }
    }

    public function finishPayment(Request $request){
        $tempBooking = session('temp_booking');

        $criteria = [
            'vehicle_id' => $tempBooking['vehicle_id'],
            'location_id' => $tempBooking['location_id'],
            'departure_time' => $tempBooking['departure_time'],
            'departure_date' => $tempBooking['departure_date'],
        ];

        try{
            $booking = Booking::create([
            'seat_total' => $tempBooking['seat_count'],
            'booking_time' => now(), 
            'status' => 'Valid',
            'price' => $tempBooking['amount'],
            'user_id' => $tempBooking['user_id'],
            ]);

            $existingBooking = SeatBooking::where($criteria)->first();

            if ($existingBooking) {
                // If there is an existing booking, merge the new seat numbers
                $existingSeats = $existingBooking->seat_number;
                $newSeats = array_merge($existingSeats, $tempBooking['seat_number']);
                $existingBooking->seat_number = array_unique($newSeats);
                $existingBooking->save();
            } else {
                // If no existing booking, create a new seat booking
                SeatBooking::create(array_merge($criteria, [
                    'seat_number' => $tempBooking['seat_number'],
                ]));
            }

            Trip::create([
                'origin' => $tempBooking['city_value'],
                'booking_id' => $booking->booking_id,
                'route_id' => $tempBooking['route_id'],
            ]);

                Payment::create([
                'amount' => $tempBooking['amount'],
                'payment_time' => now(),
                'booking_id' => $booking->booking_id, 
            ]);

            session()->forget(['setCount', 'setRoute', 'bookingData', 'seatNumber', 'temp_booking']);

        } catch(\Exception $e){
            FacadesLog::info('Error Inserting on DB : ' . $e->getMessage());
        }
        
        return response()->json(['redirect' => route('home')]);
    }
}
