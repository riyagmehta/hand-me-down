import {
	AiOutlineFacebook,
	AiOutlineInstagram,
	AiOutlineLinkedin,
} from "react-icons/ai";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineGithub } from "react-icons/ai";

const Footer = () => {
	return (
		<div className="mt-20 bg-[#272626] text-white flex flex-row flex-wrap justify-around gap-4 px-10 py-4">
			<div className="lg:flex lg:flex-col gap-2 hidden  lg:w-3/12 ">
				<span className="font-semibold text-2xl">Hand Me Down</span>
				<span>
					Stop spending money on things that are hard to sell after college,
					switch over to Hand Me Down for a smarter way to buy used stuff at
					reasonable prices and sell the stuff you don&apos;t need anymore.
				</span>
			</div>
			<div className="flex flex-col gap-2 w-full md:w-5/12 lg:w-3/12 ">
				<span className=" text-2xl">Important Links</span>
				<ul>
					<li>
						<Link href="/about">About</Link>
					</li>
					<li>
						<Link href="/sell">Sell Your items</Link>
					</li>
					<li>
						<Link href="/profile">Your Profile</Link>
					</li>
					<li>
						<Link href="/wishlist">Wishlist</Link>
					</li>
				</ul>
			</div>
			<div className="flex flex-col gap-2 w-full md:w-5/12 lg:w-3/12 ">
				<span className="text-2xl">Contact Developer</span>
				<div className="flex flex-row gap-2 items-center">
					<AiOutlineGithub size={30} />
					<a href="https://github.com/t3j3ndrA/" target="_blank">
						/t3j3ndrA
					</a>
				</div>
				<div className="flex flex-row gap-2 items-center">
					<AiOutlineLinkedin size={30} />
					<a
						href="https://www.linkedin.com/in/dhanani-tejendra-b87351210/"
						target="_blank"
					>
						/dhanani-tejendra
					</a>
				</div>
			</div>
		</div>
	);
};

export default Footer;
