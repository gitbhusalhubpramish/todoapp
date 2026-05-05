"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SquarePen, Camera } from "lucide-react";
import { redirect } from "next/navigation";
//           pp      usrname
//           bioooooooooo
//  -----------------------------------
//     project one 				del
//     project 2 				del
//====================================
//  change pass
//	del acc
//	logout
export default function setting({params}){
	const { username } = use(params)

	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [notFoundState, setNotFoundState] = useState(false);
	const [session, setSessionUser] = useState(null);
	return (
		<></>
	)
}
