import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid h-screen place-content-center bg-white px-4">
      <h1 className="uppercase tracking-widest text-3xl text-gray-500">
        404 | Not Found
      </h1>

      <br />

      <div className="relative inline-flex items-center place-items-center mt-10">
        <Button
          // className="inline-flex"
          className="bg-indigo-700/50"
          title="Return Home"
          // href="/"
        />
      </div>
    </div>
  );
}
