<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use App\Models\UserOtp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log as FacadesLog;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class HomeController extends Controller
{
    // Menampilkan halaman home
    public function homeIndex(){
        session()->forget('bookingCode');
        $user = Auth::user();  
        Session::forget([
            'booking_done',
            'schedule_done',
            'seat_done',
            'order_done',
        ]);
        
        return Inertia::render('Home/Home', [
            'credit' => $user->credit->credit_amount, 
            'username' => $user->username,
            'user_id' => $user->user_id
        ]);
    }

    public function ticketIndex(){
        $user = Auth::user();
        $bookings = Booking::with('user')
            ->with('trips')
            ->with('vehicles')
            ->get();
        
        FacadesLog::info('Booking : ' . $bookings);

        return Inertia::render('Home/MyTicket', ['bookings' => $bookings]);
    }

}
