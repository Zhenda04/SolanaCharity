import React from "react";

const Header = () =>{
    return(
        <div className="border-b-4 border-black-500 w-full">
                <img src={process.env.PUBLIC_URL+ "/logosol.jpg"} alt="SOLove" />
        </div>
    );
};

export default Header;
