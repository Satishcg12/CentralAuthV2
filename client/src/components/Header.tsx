import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/mode-toggle"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

const Header = ({
    beforeTitle,
    title,
    description,
    children
}: {
    beforeTitle?: React.ReactNode
    title: string
    description?: string
    children?: React.ReactNode
}
) => {
    const { open } = useSidebar()
    return (

        <>
            <header className="flex pt-4 shrink-0 items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <SidebarTrigger variant={'secondary'} className={`[&>svg]:transition-all [&>svg]:duration-700 ${open ? "[&>svg]:rotate-0" : "[&>svg]:rotate-180"}`} />
                    {beforeTitle && beforeTitle}
                    
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold leading-tight text-foreground">
                            {title}
                        </h1>
                        {description && (
                            <>
                                <Separator orientation="vertical" />
                                <p className="text-sm text-muted-foreground">{description}</p>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex-1" />
                {children && (
                    <div className="flex items-center gap-2">
                        {children}
                    </div>
                )}
                <Separator orientation="vertical" />
                <ModeToggle />

            </header>
            <Separator className="my-4" />
        </>
    )
}

export default Header