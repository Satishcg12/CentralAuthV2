import { cn } from "@/lib/utils"

const Logo = ({ ...props }) => {
    const { className, ...rest } = props
    const APP_NAME = import.meta.env.VITE_APP_NAME
    const APP_LOGO = import.meta.env.VITE_APP_LOGO
    return (
        <div className={cn(`bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden p-1`, className)}>
            <img
                {...rest}
                className="h-full w-auto"
                src={APP_LOGO}
                alt={APP_NAME}
            />
        </div>
    )
}

export default Logo