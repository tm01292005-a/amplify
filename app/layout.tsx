"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "antd/dist/reset.css";
import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

// Amplifyの設定
Amplify.configure(outputs);

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${inter.className} antialiased`}>
				<MantineProvider>
					<Notifications />
					{children}
				</MantineProvider>
			</body>
		</html>
	);
}
