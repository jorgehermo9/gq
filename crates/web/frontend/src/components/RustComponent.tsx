import dynamic from "next/dynamic";
import init, { test } from "gq-web"

const RustComponent = dynamic(async () => {
    await init();
    return () => <div>{test("hola")}</div>
});

export default RustComponent;