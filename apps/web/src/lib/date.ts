import { format } from "date-fns"

export const formatDateTime = (date: string) => format(date, "h:mm aa dd/MM/yyyy")
