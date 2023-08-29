window.api.send('get-iplocal');

window.api.receive('iplocal', (data) => {
    document.getElementById('instructions_iplocal').innerHTML =
    "(si la autodetección funciona puede ser: <mark>" + data[0] + "</mark>)";
});