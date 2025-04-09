import config_vars from'./_variables.json';
export const matchBreakpoint = {};
matchBreakpoint.touch = window.matchMedia("(max-width: "+(config_vars.breakpoints.desktop-1)+"px)");
matchBreakpoint.mobile = window.matchMedia("(max-width: "+(config_vars.breakpoints.tablet-1)+"px)");
matchBreakpoint.fromDesktop = window.matchMedia("(min-width: "+(config_vars.breakpoints.desktop)+"px)");
function is_mobile() {
    return matchBreakpoint.mobile.matches;
}
function is_touch() {
    return matchBreakpoint.touch.matches;
}