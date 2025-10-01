import { Poppins } from "next/font/google";
import "./globals.css";

const font = Poppins({
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "GHRI",
  description: "Transforming Healthcare in the world",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${font.className} bg-[#FFFFFF] text-[#18181B] text-sm leading-relaxed`}
      >
        <div className="mt-[94px] xl:mt-[104px] ">{children}</div>
      </body>
    </html>
  );
}
