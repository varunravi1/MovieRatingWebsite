interface emsg {
  msg: string;
}
function ErrorMsg({ msg }: emsg) {
  return <div className="text-err-red text-s  pb-2 font-sans">{msg}</div>;
}

export default ErrorMsg;
