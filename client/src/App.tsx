import { useEffect, useRef, useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { v4 } from "uuid";

export function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false); //connection status
  const socketRef = useRef<null | WebSocket>(null); // socket represent
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const s = new WebSocket("ws://localhost:8080"); // http -> upgrade -> ws
    s.onopen = function (arg) {
      console.log("Connected, arg:", arg);
      setIsConnected(true);
      socketRef.current = s;
      socketRef.current.send(`Client ID: ${v4()}`);
    };

    s.onmessage = function (event) {
      console.log("event in onmessage:", event);
      setMessages((prev) => [...prev, event.data]);
    };

    s.onclose = (arg) => {
      console.log("Disconnected, arg:", arg);
      socketRef.current = null;
      setIsConnected(false);
    };

    s.onerror = function (err) {
      console.error("Websocket errored out:", err);
    };

    return () => {
      if (
        s.readyState === WebSocket.OPEN ||
        s.readyState === WebSocket.CONNECTING
      ) {
        s.close();
      }
    };
  }, []);

  function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(text);
      setText("");
    } else {
      console.warn("Websocket not open/initialized.");
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-screen justify-center items-center gap-5 ">
      <div className="border-2 border-red-500 rounded-md flex flex-col gap-3 h-[20vh] w-[20vw] overflow-auto">
        {messages.map((message, idx) => (
          <div key={idx} className="border-b-2 p-2">
            <p className="text-lg font-bold text-neutral-500">{message}</p>
          </div>
        ))}
      </div>
      <form
        onSubmit={sendMessage} // onSubmit - event listener, sendMessage = event handler, callback
        className="flex flex-row gap-2 items-center w-full max-w-sm"
      >
        <Input
          onChange={(e) => setText(e.target.value)}
          value={text}
          className="flex-grow"
          placeholder="Enter Message"
        />
        <Button
          type="submit"
          variant={"default"}
          size={"sm"}
          disabled={!isConnected || !socketRef.current || text.trim() === ""} // Disable if no socket or empty text
        >
          Send
        </Button>
      </form>
      <p>Connection Status: {isConnected ? "Connected" : "Not Connected"}</p>
    </div>
  );
}

export default App;
