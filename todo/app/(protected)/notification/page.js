"use client";

import Link from "next/link";
import Image from "next/image";

const dummyNotifications = [
  {
    type: "follow",
    user: { username: "ram123", profilePic: "/profile.svg" },
    entity: { type: "user", username: "ram123" },
    createdAt: "2026-05-02T12:00:00Z",
    read: false,
  },
  {
    type: "like",
    user: { username: "sita_dev", profilePic: "/profile.svg" },
    entity: { type: "project", username: "pramish", project: "todo-app" },
    createdAt: "2026-05-02T10:30:00Z",
    read: true,
  },
];

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
  ];

  for (let i of intervals) {
    const val = Math.floor(seconds / i.seconds);
    if (val >= 1) return `${val}${i.label}`;
  }
  return "now";
}

function getHref(entity) {
  return entity.type === "user"
    ? `/${entity.username}`
    : `/${entity.username}/${entity.project}`;
}

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] dark:text-white">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-4">Notifications</h1>

        <div className="flex flex-col gap-2">
          {dummyNotifications.map((notif, index) => (
            <Link
              key={index}
              href={getHref(notif.entity)}
              className={` relative flex items-center gap-3 p-3 rounded-xl transition
                ${
                  !notif.read
                    ? "bg-white/70 dark:bg-zinc-900/60"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }
              `}
            >
              {/* Left unread bar */}
              {!notif.read && (
                <div className="absolute left-0 top-0 h-full w-1 bg-green-500 rounded-l-xl" />
              )}

              {/* Profile */}
              <Image
                src={notif.user.profilePic}
                alt="pfp"
                width={40}
                height={40}
                className="rounded-full"
              />

              {/* Content */}
              <div className="flex-1 text-sm flex items-center gap-2">
                {!notif.read && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}

                <span>
                  <span className="font-semibold">
                    <Link href={`/${notif.user.username}`}>{notif.user.username}</Link>
                  </span>{" "}
                  {notif.type === "follow"
                    ? "started following you"
                    : "liked your project"}
                </span>
              </div>

              {/* Time */}
              <div className="text-xs text-zinc-500 whitespace-nowrap">
                {timeAgo(notif.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
