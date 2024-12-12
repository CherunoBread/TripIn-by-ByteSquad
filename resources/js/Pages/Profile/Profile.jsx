import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import NavbarTripin from "@/Components/NavbarTripin";
import ModalComponent from "@/Components/ModalComponent";
import { ToastComponent } from "@/Components/ToastComponent";

const Profile = () => {
    const [notification, setNotification] = useState(null);
    const { auth, flash = {} } = usePage().props; // Provide a default empty object
    const { user } = auth;
    const [isModalHidden, setIsModalHidden] = useState(true);
    const [toastMessage, setToastMessage] = useState("");
    function modalVisibility() {
        setIsModalHidden((prev) => !prev);
    }

    useEffect(() => {
        if (flash && flash.success) {
            setNotification({
                type: "success",
                message: flash.success,
            });

            // setToastMessage(notification.message);
            // Auto-dismiss notification after 3 seconds
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);

            // Cleanup the timer
            return () => clearTimeout(timer);
        }
    }, [flash.success]);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth", // Optional: smooth scrolling
        });
        console.log("rerendering gakni");
    }, []);

    if (sessionStorage.getItem("reloaded") === "true") {
        sessionStorage.removeItem("reloaded"); // Remove the flag after first reload
    }
    const handleLogout = async () => {
        await fetch("/sanctum/csrf-cookie");

        const csrfToken = document.head.querySelector(
            'meta[name="csrf-token"]',
        ).content;

        try {
            const response = await fetch("/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
            });

            if (response.ok) {
                window.location.href = "/welcome"; // Redirect to login after logout
            } else {
                alert("Logout failed, please try again");
            }
        } catch (error) {
            console.error("Error during logout:", error);
            alert("Logout failed, please try again");
        }
    };

    return (
        <>
            {/* {notification && (
                <div
                    className={`fixed left-0 right-0 top-0 z-50 ${
                        notification.type === "success"
                            ? "bg-primary"
                            : "bg-red-500"
                    } animate-bounce py-9 text-center text-white transition-all duration-300 ease-in-out`}
                >
                    {notification.message}
                </div>
            )} */}
            {notification && (
                <div className="nowrap fixed left-1/2 top-5 flex h-fit w-fit items-center justify-center">
                    <ToastComponent
                        message={notification.message}
                        onClose={() => setToastMessage("")}
                        type="success"
                    />
                </div>
            )}

            <div className="flex justify-center">
                <div className="h-fit w-full lg:max-w-[400px]">
                    <div className="h-[220px] w-full bg-primary">
                        <p className="pt-16 text-center text-3xl font-semibold text-white">
                            Profile
                        </p>
                    </div>
                    <div className="mt-[-1.75rem] h-full min-h-[100dvh] w-full rounded-t-3xl bg-white px-6">
                        <div className="flex flex-col items-center">
                            <div className="mt-[-3.5rem] h-[120px] w-[120px] overflow-hidden rounded-full ring-4 ring-blue-300">
                                <img
                                    src="https://placehold.co/120x120"
                                    loading="lazy"
                                />
                            </div>
                            <p className="text-center text-3xl font-semibold">
                                {user.username}
                            </p>
                            <p className="text-center text-sm font-light">
                                {user.email}
                            </p>
                            <p className="text-center text-xs font-light">
                                {user.phone_number}
                            </p>
                        </div>
                        <div className="h-max-[230px] w-max-[392px] py-3">
                            <p className="pl-2 text-lg font-medium leading-10">
                                Account
                            </p>
                            <div className="grid h-[158px] w-full grid-cols-1 overflow-hidden rounded-md">
                                <Link
                                    href="/profile/edit"
                                    className="flex flex-row items-center bg-[#DADADA59] px-5 text-lg font-medium hover:bg-primary hover:text-white"
                                >
                                    <img
                                        src="/profile.svg"
                                        alt="icon"
                                        loading="lazy"
                                    />
                                    <p className="px-5 text-sm">Edit Profile</p>
                                </Link>
                                <Link
                                    href="/notification"
                                    className="flex flex-row items-center border-y-2 bg-[#DADADA59] px-5 text-lg font-medium hover:bg-primary hover:text-white"
                                >
                                    <img
                                        src="/notif.svg"
                                        alt="icon"
                                        loading="lazy"
                                    />
                                    <p className="px-[27px] text-sm">
                                        Notification
                                    </p>
                                </Link>
                                <Link
                                    href="/profile/history"
                                    className="flex flex-row items-center bg-[#DADADA59] px-5 text-lg font-medium hover:bg-primary hover:text-white"
                                >
                                    <img
                                        src="/history.svg"
                                        alt="icon"
                                        loading="lazy"
                                    />
                                    <p className="px-5 text-sm">History</p>
                                </Link>
                            </div>
                        </div>
                        <div className="h-max-[230px] w-max-[392px] py-3">
                            <p className="pl-2 text-lg font-medium leading-10">
                                About
                            </p>
                            <div className="grid h-[158px] w-full grid-cols-1 overflow-hidden rounded-md">
                                <Link
                                    href="/faq"
                                    className="flex flex-row items-center bg-[#DADADA59] px-5 text-lg font-medium hover:bg-primary hover:text-white"
                                >
                                    <img
                                        src="/faq.svg"
                                        alt="icon"
                                        loading="lazy"
                                    />
                                    <p className="px-5 text-sm">FAQ</p>
                                </Link>
                                <Link
                                    href="/terms-condition"
                                    className="flex flex-row items-center border-y-2 bg-[#DADADA59] px-5 text-lg font-medium hover:bg-primary hover:text-white"
                                >
                                    <img
                                        src="/term.svg"
                                        alt="icon"
                                        loading="lazy"
                                    />
                                    <p className="px-6 text-sm">
                                        Term & Conditions
                                    </p>
                                </Link>
                                <Link
                                    href="/privacy-policy"
                                    className="flex flex-row items-center bg-[#DADADA59] px-5 text-lg font-medium hover:bg-primary hover:text-white"
                                >
                                    <img
                                        src="/privacy.svg"
                                        alt="icon"
                                        loading="lazy"
                                    />
                                    <p className="px-5 text-sm">
                                        Privacy Policy
                                    </p>
                                </Link>
                            </div>
                        </div>
                        <div className="h-max-[230px] w-max-[392px] py-3">
                            <p className="text-lg font-bold leading-10">
                                Action
                            </p>
                            <div className="mb-16 h-[52px] w-full overflow-hidden rounded-md">
                                <button
                                    onClick={modalVisibility}
                                    className="flex h-[52px] w-full flex-row items-center bg-[#DADADA59] px-5 text-lg font-medium hover:bg-primary hover:text-white"
                                >
                                    <img
                                        src="/logout.svg"
                                        alt="icon"
                                        loading="lazy"
                                    />
                                    <p className="px-5 text-sm">Log Out</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <NavbarTripin pageInfo={"Profile"} />
            <ModalComponent
                isModalHidden={isModalHidden}
                setIsModalHidden={setIsModalHidden}
            >
                <div className="flex h-[160px] w-[300px] flex-col overflow-hidden sm:w-[360px] md:h-[180px]">
                    <div className="p-6 sm:p-8">
                        <p className="text-center text-2xl font-semibold text-red-400 opacity-100">
                            Logout
                        </p>
                        <p className="text-center text-base font-extralight text-black opacity-100">
                            Are you sure?
                        </p>
                    </div>
                    <div className="h-full rounded-b-xl">
                        <div className="grid h-full grid-cols-2">
                            <button
                                className="rounded-es-lg border-t border-black bg-transparent text-black transition-colors duration-200 hover:bg-yellow-500 hover:text-white sm:text-lg"
                                onClick={modalVisibility}
                            >
                                Cancel
                            </button>
                            <button
                                className="rounded-ee-lg border-l border-t border-black bg-transparent text-black transition-colors duration-200 hover:bg-red-500 hover:text-white sm:text-lg"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </ModalComponent>
        </>
    );
};

export default Profile;
