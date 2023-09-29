import React from "react";

const Header = () =>{
    return(
        <div className="border-b-4 border-black-500 w-full flex justify-center items-center">
                <img src={window.location.origin+ "/logosol.jpg"} alt="SOLove" width={300} />
        </div>
    );
};

export default Header;
