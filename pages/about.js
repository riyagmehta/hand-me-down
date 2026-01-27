import React from "react";
import Navbar from "../components/Navbar";
import aboutUsImg from "../public/about-us.jpg";
import Image from "next/image";
import Footer from "../components/Footer";

const About = () => {
	return (
		<>
			<Navbar focusOn={"about"} />
			<div className="flex flex-col px-4 my-4 lg:flex-row lg:items-center">
				<div className="mt-2 flex flex-col gap-4 lg:w-1/2 lg:px-28">
					<p className="font-bold uppercase text-5xl text-blue-500">About US</p>
					<p className=" text-gray-800 text-justify ">
						With Hand Me Down, you can now save money and get everything that
						you need - books, household items and more - from peers near you!
						Stop spending money on things that are hard to sell after college,
						switch over to Hand Me Down for a smarter way to buy used stuff at
						reasonable prices and sell the stuff you don{"'"}t need anymore . It
						{"'"}s time to put your used stuff back into circulation and make
						your home-away-from-home as comfortable as it can be.
					</p>
				</div>
				<div className="w-full lg:w-1/2">
					<Image
						src={aboutUsImg}
						className="w-full h-auto"
						alt="about us image"
					/>
				</div>
			</div>
			<Footer />
		</>
	);
};

export default About;
