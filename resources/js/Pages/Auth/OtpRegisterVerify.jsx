import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ButtonComponent from "@/Components/ButtonComponent";
import ModalComponent from "@/Components/ModalComponent";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

const OtpRegistVerify = ({ email }) => {
    const [verificationCode, setVerificationCode] = useState(["", "", "", ""]);
    const [error, setError] = useState("");
    const [isModalHidden, setIsModalHidden] = useState(true);
    const [modalMessage, setModalMessage] = useState("");
    const inputFocus = useRef([]);
    useEffect(() => {
        if (inputFocus.current[0]) {
            inputFocus.current[0].focus();
        }
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const csrfToken = document.head.querySelector(
            'meta[name="csrf-token"]'
        ).content;
        const otp = verificationCode.join("");

        try {
            const response = await axios.post(
                "/register/otp/verify",
                {
                    email,
                    otp,
                },
                {
                    headers: { "X-CSRF-TOKEN": csrfToken },
                }
            );

            // Show success modal
            setModalMessage("OTP verification successful! Redirecting...");
            setIsModalHidden(false);

            // Redirect after a delay to allow the user to see the message
            setTimeout(() => {
                window.location.href = route("auth");
            }, 2000); // 2000 milliseconds = 2 seconds
        } catch (err) {
            if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        }
    };

    const handleChange = (index, value) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newCode = [...verificationCode];
            newCode[index] = value;
            setVerificationCode(newCode);

            // Auto-focus next input
            if (value && index < 3) {
                const nextInput = document.querySelector(
                    `input[name="code-${index + 1}"]`
                );
                nextInput?.focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
            const prevInput = document.querySelector(
                `input[name="code-${index - 1}"]`
            );
            prevInput?.focus();
        }
    };

    return (
        <>
            <div className="lg:flex lg:justify-center">
                <div className="flex flex-col min-h-screen bg-primary lg:w-[400px]">
                    {/* Logo Section */}
                    <div className="  flex-none flex justify-center px-4 py-20">
                        <img
                            src="/TripInLogo.svg"
                            className="w-36 object-contain"
                            alt="Logo of TripIn"
                        />
                    </div>

                    {/* Verification Content */}
                    <div className="flex-grow bg-white rounded-t-md p-6">
                        <div className="max-w-md mx-auto p-2">
                            <h1 className="text-2xl font-semibold text-black mb-2">
                                Verification Code
                            </h1>
                            <p className="text-gray-500 mb-8">
                                We have sent the verification code to your email
                                address
                            </p>

                            {/* Code Input Fields */}
                            <form onSubmit={handleSubmit}>
                                <div className="flex justify-between gap-3 mb-8">
                                    {verificationCode.map((digit, index) => (
                                        <input
                                            ref={(el) =>
                                                (inputFocus.current[index] = el)
                                            }
                                            key={index}
                                            type="text"
                                            inputMode="numeric"
                                            name={`code-${index}`}
                                            value={digit}
                                            onChange={(e) =>
                                                handleChange(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleKeyDown(index, e)
                                            }
                                            className="w-16 h-16 border-2 border-gray-200 rounded-xl
                            text-center bg-transparent text-xl text-black
                            font-semibold focus:border-gray-400 focus:outline-none
                            transition-colors"
                                            maxLength={1}
                                        />
                                    ))}
                                </div>
                                {error && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {error}
                                    </p>
                                )}
                                {/* Confirm Button */}

                                <ButtonComponent buttonText="confirm" />
                                <div
                                    className="absolute cursor-pointer  p-2 w-fit bottom-20 -translate-y-1/2 left-1/2 -translate-x-1/2 flex justify-center gap-1 bg-white items-center  rounded-md"
                                    onClick={() => history.back()}
                                >
                                    <ArrowLeftIcon className="size-4 cursor-pointer text-primary2"></ArrowLeftIcon>
                                    <p className="text-primary2 text-sm">
                                        go back to sign up
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                    <ModalComponent
                        isModalHidden={isModalHidden}
                        setIsModalHidden={setIsModalHidden}
                    >
                        <div className="w-[225px] h-[145px] flex flex-col items-center justify-center">
                            <img src="/success.svg" />
                            <p className="text-sm font-normal text-center">
                                {modalMessage}
                            </p>
                        </div>
                    </ModalComponent>
                </div>
            </div>
        </>
    );
};

export default OtpRegistVerify;
