const HistoryComponent = ({ CardProp }) => {
    const handleClick = (id) => {
        console.log("Clicked with log id : ", id);
        window.location.href = `/profile/history/${id}/detail`;
    };

    return (
        <div
            onClick={() => handleClick(CardProp.logId)}
            className="w-full h-fit rounded-[10px] border border-[#8BAFCE80] bg-white "
        >
            <div className="flex px-4 pt-7 pb-3  items-center gap-3">
                <div>
                    <img src="/shuttle_icon.svg" alt="shuttle_icon" />
                </div>
                <div className="flex-row justify-start items-start h-fit">
                    <h3 className="text-base font-bold">{CardProp.name}</h3>
                    <p className="text-black text-sm">
                        Booking Code: {CardProp.bookingCode}
                    </p>
                </div>
                <div className="text-right self-center">
                    <p className="text-xs text-primary">{CardProp.seat}</p>
                    <p className="text-xs text-black">{CardProp.passengers}</p>
                </div>
            </div>
            <div className="grid grid-cols-[5rem_1fr] pb-6 relative">
                <div className="h-full flex justify-end relative top-2 right-1">
                    <img
                        className="h-[72px] w-[12px]"
                        src="/cardLine.svg"
                        alt="cardLine"
                    />
                </div>
                <div className="h-full text-black">
                    <div className="grid grid-cols-1 gap-2">
                        <div className="flex flex-col justify-start">
                            <p className="text-sm w-fit">From:</p>
                            <div className="flex items-center gap-2">
                                <p className="font-bold w-fit text-xs whitespace-nowrap">
                                    {CardProp.originTime
                                        .split(":")
                                        .slice(0, 2)
                                        .join(":")}
                                </p>
                                <p className="font-medium w-fit text-xs break-words ">
                                    {CardProp.origin}
                                </p>
                            </div>
                        </div>
                        <div className="justify-start">
                            <p className="text-xs text-gray-500 w-fit">
                                {CardProp.duration}
                            </p>
                        </div>
                        <div className="flex flex-col justify-start">
                            <p className="text-sm w-fit">To:</p>
                            <div className="flex items-center gap-1">
                                <p className="font-bold w-fit text-xs whitespace-nowrap">
                                    {CardProp.destinationTime
                                        .split(":")
                                        .slice(0, 2)
                                        .join(":")}
                                </p>
                                <p className="font-medium w-fit text-xs break-words">
                                    {CardProp.destination}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-3 right-4 text-right">
                    <p className="text-sm w-fit">Price:</p>
                    <p className="font-bold w-fit text-m">{CardProp.price}</p>
                </div>
            </div>
        </div>
    );
};

export default HistoryComponent;
