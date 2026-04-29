import { redirect } from "next/navigation";

export default function TaskRedirectPage() {
  redirect("/tasks");
}
