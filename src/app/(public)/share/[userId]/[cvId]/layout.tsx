import { connection } from "next/server";
import { ReactNode, Suspense } from "react";


export default async function ShareLayout({ children }: { children: ReactNode }) {
    await connection()

    return (
        <Suspense>
            {children}
        </Suspense>
    )
}