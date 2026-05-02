"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
export default function followers({ params }){
	const {username} = use(params)
	
	return (
		<></>
	)
}
