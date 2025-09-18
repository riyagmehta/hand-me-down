import React, { useEffect, useState } from "react";
import {
	AiOutlineUser,
	AiOutlineShop,
	AiOutlineTrophy,
	AiOutlineUserSwitch,
	AiOutlineBars,
	AiOutlineLogout,
	AiTwotoneHeart,
	AiOutlineHeart,
} from "react-icons/ai";

import Link from "next/link";
import getUser from "../lib/getUser";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/router";
import Image from "next/image";
const MenuItem = ({ href, title, name, focusOn }) => {
	return (
		<Link href={href}>
			<div
				className={`flex gap-8 items-center  rounded-md px-2 py-1 hover:bg-hover`}
			>
				<span
					className={`font-light text-xl  ${
						focusOn === name
							? "underline underline-offset-8 text-blue-600 "
							: ""
					}`}
				>
					{title}
				</span>
			</div>
		</Link>
	);
};

const Navbar = ({ focusOn }) => {
	const [open, setOpen] = useState(false);
	const [user, setUser] = useState({});
	const router = useRouter();
	useEffect(() => {
		setUser(getUser());
	}, []);

	const handleLogout = async () => {
		deleteCookie("token");
		deleteCookie("name");
		setUser(getUser());
		router.replace("/");
	};

	return (
		<div className="px-3 py-8 lg:flex lg:flex-row lg:justify-around stroke-indigo-300  bg-white border-b-[1px] border-gray-300">
			{/* Top section */}
			<Link href="/">
				<div className="flex flex-row justify-between items-center">
					<div className="flex flex-row gap-2 items-center">
						<Image
							src={require("../public/hmd.png")}
							alt="logo"
							className=" w-20 h-auto"
						/>
						<span className="font-semibold text-2xl text-blue-500">
							Hand Me Down{" "}
						</span>
					</div>
					<div>
						<AiOutlineBars
							className="text-2xl lg:hidden"
							onClick={() => setOpen(!open)}
						/>
					</div>
				</div>
			</Link>

			{/* Nav items */}

			<div
				className={`flex flex-col relative gap-5  ${
					open ? "flex" : "hidden"
				}  mt-5  justify-center lg:flex lg:flex-row lg:mt-0 `}
			>
				<MenuItem focusOn={focusOn} href={"/"} title={"Home"} name="home" />
				<MenuItem
					focusOn={focusOn}
					href={"/about"}
					title={"About"}
					name="about"
				/>
				<MenuItem
					focusOn={focusOn}
					href={"/sell"}
					title={"Sell Now"}
					name="sell"
				/>
				<Link href="/wishlist">
					<div
						className={`flex gap-1 items-center rounded-md px-2 py-1 hover:bg-hover ${
							focusOn === "wishlist"
								? "underline  underline-offset-8 text-blue-600 "
								: ""
						}`}
					>
						<span className="font-light text-xl">Wishlist</span>
						<AiOutlineHeart className="text-2xl" />
					</div>
				</Link>
				{user.name ? (
					<>
						<MenuItem
							focusOn={focusOn}
							href={"/profile"}
							title={user.name + "'s Profile"}
							name="profile"
						/>

						<div
							className={`flex gap-2 items-center rounded-md px-2 py-1  hover:cursor-pointer ${
								user.name ? "" : "hidden"
							}`}
							onClick={handleLogout}
						>
							<AiOutlineLogout className="text-2xl" />
							<span className="font-light text-xl">{`${"Logout"}`}</span>
						</div>
					</>
				) : (
					<>
						<MenuItem
							focusOn={focusOn}
							href={"/login"}
							title={"Login"}
							name="login"
						/>

						<MenuItem
							focusOn={focusOn}
							href={"/register"}
							title={"Register"}
							name="register"
						/>
					</>
				)}
			</div>
		</div>
	);
};

export default Navbar;
