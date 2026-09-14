import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "คลังลวดลายไทย",
    short_name: "ลวดลายไทย",
    description: "บันทึก แกะลาย และสืบค้นลวดลายไทยจากภาพถ่ายในชุมชน",
    // The app opens on the camera, which is what someone launching from the
    // home screen came to do.
    start_url: "/capture",
    display: "standalone",
    orientation: "portrait",
    background_color: "#EFECE2",
    theme_color: "#2F5136",
    lang: "th",
    dir: "ltr",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
