!function(n) {
  console.log("hi")
    var r = {};
    function o(e) {
        if (r[e])
            return r[e].exports;
        var t = r[e] = {
            i: e,
            l: !1,
            exports: {}
        };
        return n[e].call(t.exports, t, t.exports, o),
        t.l = !0,
        t.exports
    }
    o.m = n,
    o.c = r,
    o.d = function(e, t, n) {
        o.o(e, t) || Object.defineProperty(e, t, {
            enumerable: !0,
            get: n
        })
    }
    ,
    o.r = function(e) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
        }),
        Object.defineProperty(e, "__esModule", {
            value: !0
        })
    }
    ,
    o.t = function(t, e) {
        if (1 & e && (t = o(t)),
        8 & e)
            return t;
        if (4 & e && "object" == typeof t && t && t.__esModule)
            return t;
        var n = Object.create(null);
        if (o.r(n),
        Object.defineProperty(n, "default", {
            enumerable: !0,
            value: t
        }),
        2 & e && "string" != typeof t)
            for (var r in t)
                o.d(n, r, function(e) {
                    return t[e]
                }
                .bind(null, r));
        return n
    }
    ,
    o.n = function(e) {
        var t = e && e.__esModule ? function() {
            return e.default
        }
        : function() {
            return e
        }
        ;
        return o.d(t, "a", t),
        t
    }
    ,
    o.o = function(e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }
    ,
    o.p = "",
    o(o.s = "./src/index.ts")
}({
    "./src/example0.ts": function(e, t, n) {
        "use strict";
        n.r(t),
        n.d(t, "initExample0", function() {
            return r
        });
        var x = n("./src/fov_common.ts");
        function r(o, l) {
            var u, i, e, c, s, a, d, f, p, m, v, t, n = document.getElementById("example0"), r = null == n ? void 0 : n.getElementsByClassName("foreground"), h = null == n ? void 0 : n.getElementsByClassName("background"), g = document.getElementById("outlines"), x = document.getElementById("walls"), w = document.getElementById("umbra");
            n && x && w && g && r && 1 == r.length && h && 1 == h.length && (u = r[0],
            i = h[0],
            (e = function(e, t, n, r) {
                var o = e.textContent
                  , l = t.textContent;
                if (!o || o.length < n * r)
                    return null;
                if (!l || l.length < n * r)
                    return null;
                for (var u = [], i = [], c = 0; c < r; c++) {
                    u.push([]),
                    i.push([]);
                    for (var s = 0; s < n; s++) {
                        var a = c * (n + 1) + s;
                        if ("·" == o[a] || "#" == o[a])
                            u[c].push(!0),
                            i[c].push(o[a]);
                        else if ("·" == l[a] || "#" == l[a])
                            u[c].push(!1),
                            i[c].push(l[a]);
                        else {
                            if ("@" != o[a])
                                return null;
                            u[c].push(!0),
                            i[c].push("@")
                        }
                    }
                }
                return [u, i]
            }(u, i, o, l)) && (c = e[0],
            s = e[1],
            a = (l - 1) / 2,
            d = (o - 1) / 2,
            f = n.getBoundingClientRect().width / o,
            m = p = 0,
            v = null,
            g.addEventListener("input", function() {
                g.checked ? n.classList.remove("hide-outlines") : n.classList.add("hide-outlines")
            }),
            n.addEventListener("mousedown", function() {
                if ("#" == s[p][m])
                    v = "·";
                else {
                    if ("·" != s[p][m])
                        return;
                    v = "#"
                }
                s[p][m] = v;
                var e = y(a, d, s, c);
                b(c, s, u, i, x, w, e)
            }),
            n.addEventListener("mousemove", function(e) {
                var t, n = Math.floor(e.offsetX / f), r = Math.floor(e.offsetY / f);
                if (r != p || n != m) {
                    if (l <= r || o <= n)
                        return;
                    p = r,
                    m = n,
                    v && "@" != s[p][m] && (s[p][m] = v,
                    t = y(a, d, s, c),
                    b(c, s, u, i, x, w, t))
                }
            }),
            window.addEventListener("mouseup", function() {
                v = null
            }),
            t = y(a, d, s, c),
            b(c, s, u, i, x, w, t)))
        }
        function b(r, o, e, t, n, l, u) {
            function i(e) {
                var t = e[0];
                return 5 + 10 * e[1] + " " + (5 + 10 * t)
            }
            e.textContent = o.map(function(e, n) {
                return e.map(function(e, t) {
                    return r[n][t] ? e : " "
                }).join("")
            }).join("\n"),
            t.textContent = o.map(function(e, n) {
                return e.map(function(e, t) {
                    return r[n][t] ? " " : e
                }).join("")
            }).join("\n"),
            n.setAttribute("d", ""),
            l.setAttribute("d", "");
            for (var c = "", s = !1, a = 0; a < u.length; a++) {
                var d = u[a];
                "Move" == d ? s = !0 : s ? (c += " M " + i(d),
                s = !1) : c += " L " + i(d)
            }
            function f(e, t) {
                return 0 <= e && 0 <= t && e < o.length && t < o[e].length && "#" == o[e][t]
            }
            l.setAttribute("d", c);
            var p = Object(x.traceAllWalls)(function(e) {
                for (var t = 0; t < o.length; t++)
                    for (var n = -1; n < o[t].length; n++)
                        !f(t, n) && f(t, n + 1) && e(t, n + 1)
            }, f);
            n.setAttribute("d", p)
        }
        function y(s, a, d, c) {
            for (var e = 0; e < c.length; e++)
                for (var t = 0; t < c[e].length; t++)
                    c[e][t] = !1;
            c[s][a] = !0;
            var f = ["Move"];
            function p(e, t, n, r) {
                var o, l = e.depth, u = t;
                1 & n && (l = -l),
                2 & n && (o = l,
                l = u,
                u = o);
                var i = s + l
                  , c = a + u;
                return !r && (c < 0 || i < 0 || i >= d.length || c >= d[0].length) ? null : [s + l, a + u]
            }
            function m(e, t, n) {
                var r = p(e, t, n);
                if (r) {
                    var o = r[0]
                      , l = r[1];
                    return "#" == d[o][l]
                }
                return 1
            }
            function v(e, t, n) {
                var r = p(e, t, n);
                if (r) {
                    var o = r[0]
                      , l = r[1];
                    return "·" == d[o][l]
                }
            }
            function h(e, t, n) {
                var r;
                1 == t.den && 1 == Math.abs(t.num) || (r = p(e = {
                    depth: e.depth,
                    start: e.start,
                    end: e.end
                }, e.depth * t.num / t.den, n, !0)) && f.push(r)
            }
            function g(e, t) {
                h(e, e.start, t),
                f.push("Move");
                for (var n, r, o, l = Object(x.minCol)(e); l <= Object(x.maxCol)(e); l++)
                    (m(e, l, t) || Object(x.isSymmetric)(e, l)) && (0,
                    (o = p(e, l, t)) && (n = o[0],
                    r = o[1],
                    c[n][r] = !0));
                for (var u = Object(x.minCol)(e); u < Object(x.maxCol)(e); u++) {
                    var i = u + 1;
                    m(e, u, t) && v(e, i, t) && (e.start = Object(x.slope)(e, i)),
                    v(e, u, t) && m(e, i, t) && (h(e, e.start, t),
                    g({
                        depth: e.depth + 1,
                        start: e.start,
                        end: Object(x.slope)(e, i)
                    }, t),
                    h(e, Object(x.slope)(e, i), t),
                    f.push("Move"))
                }
                v(e, Object(x.maxCol)(e), t) && (h(e, e.start, t),
                g({
                    depth: e.depth + 1,
                    start: e.start,
                    end: e.end
                }, t)),
                h(e, e.end, t)
            }
            for (var n = 0; n < 4; n++) {
                g(e = {
                    depth: 1,
                    start: {
                        num: -1,
                        den: 1
                    },
                    end: {
                        num: 1,
                        den: 1
                    }
                }, n),
                f.push("Move")
            }
            return f
        }
    },
    "./src/example1.ts": function(e, t, n) {
        "use strict";
        function r() {
            var e = document.getElementById("example1")
              , t = document.getElementById("raycasting")
              , n = document.getElementById("shadowcasting");
            e && t && n && (t.addEventListener("input", function() {
                e.classList.remove("shadow"),
                e.classList.add("ray")
            }),
            n.addEventListener("input", function() {
                e.classList.remove("ray"),
                e.classList.add("shadow")
            }))
        }
        n.r(t),
        n.d(t, "initExample1", function() {
            return r
        })
    },
    "./src/example2.ts": function(e, t, n) {
        "use strict";
        n.r(t),
        n.d(t, "initExample2", function() {
            return r
        });
        var C = n("./src/fov_common.ts");
        function r(i) {
            var c, s, a, d, f, r, p, m, o, l, e = document.getElementById("example2"), t = null == e ? void 0 : e.getElementsByClassName("foreground"), n = null == e ? void 0 : e.getElementsByClassName("background"), u = document.getElementById("prev2"), v = document.getElementById("next2"), h = document.getElementById("slider2"), g = document.getElementById("walls2"), x = document.getElementById("start2"), w = document.getElementById("end2"), b = document.getElementById("row2"), y = document.getElementById("col2"), k = Array.from(document.querySelectorAll("#example2wrapper .line"));
            e && t && 1 == t.length && n && 1 == n.length && u && v && h && g && x && w && b && y && (c = t[0],
            s = n[0],
            (a = function(e, t, n) {
                var r = e.textContent
                  , o = t.textContent;
                if (!r || !o)
                    return null;
                for (var l = [], u = [], i = 0, c = 0; c < n; c++) {
                    l.push([]),
                    u.push([]),
                    i += n - c - 1;
                    for (var s = n - 1 - c; s < n + c; s++,
                    i++)
                        if ("·" == r[i] || "#" == r[i])
                            u[c][s] = r[i];
                        else if ("·" == o[i] || "#" == o[i])
                            u[c][s] = o[i];
                        else {
                            if ("@" != r[i])
                                return null;
                            u[c][s] = "@"
                        }
                    i++
                }
                var a = {
                    visible: l,
                    text: u,
                    tick: 0,
                    maxTick: 0,
                    line: [],
                    start: [],
                    end: [],
                    row: [],
                    col: []
                };
                return j(0, n - 1, a, n - 1),
                a.tick = 1,
                a
            }(c, s, i)) && (d = a.text,
            h.max = a.maxTick,
            h.value = "1",
            f = i - 1,
            r = e.getBoundingClientRect().height / i,
            m = p = 0,
            o = null,
            l = function(e) {
                if (d[p][m] = e,
                a.tick == a.maxTick)
                    return j(0, f, a, i - 1),
                    h.max = a.maxTick,
                    h.value = a.tick,
                    void E(a, c, s, g, x, w, b, y, k);
                var t = a.line[a.tick]
                  , n = a.row[a.tick]
                  , r = a.col[a.tick];
                j(0, f, a, i - 1);
                for (var o = null, l = null, u = 0; u < a.maxTick; u++)
                    if (a.row[u] == n && a.col[u] == r) {
                        if (a.line[u] == t) {
                            o = u;
                            break
                        }
                        null == l && (l = u)
                    }
                null != o ? a.tick = o : null != l && (a.tick = l),
                h.max = a.maxTick,
                h.value = a.tick,
                E(a, c, s, g, x, w, b, y, k)
            }
            ,
            e.addEventListener("mousedown", function() {
                if (O(p, m, i)) {
                    if ("#" == d[p][m])
                        o = "·";
                    else {
                        if ("·" != d[p][m])
                            return;
                        o = "#"
                    }
                    l(o)
                }
            }),
            e.addEventListener("mousemove", function(e) {
                var t = Math.floor(e.offsetX / r)
                  , n = Math.floor(e.offsetY / r);
                if (n != p || t != m) {
                    if (!O(p = n, m = t, i))
                        return;
                    o && "@" != d[p][m] && l(o)
                }
            }),
            window.addEventListener("mouseup", function() {
                o && (o = null,
                h.focus({
                    preventScroll: !0
                }))
            }),
            h.addEventListener("input", function() {
                a.tick = this.valueAsNumber,
                E(a, c, s, g, x, w, b, y, k)
            }),
            u.addEventListener("click", function() {
                1 < a.tick && (a.tick--,
                h.value = a.tick,
                E(a, c, s, g, x, w, b, y, k)),
                h.focus({
                    preventScroll: !0
                })
            }),
            v.addEventListener("click", function() {
                var e = a.maxTick;
                a.tick < e && (a.tick++,
                h.value = a.tick,
                E(a, c, s, g, x, w, b, y, k)),
                h.focus({
                    preventScroll: !0
                })
            }),
            E(a, c, s, g, x, w, b, y, k)))
        }
        function E(n, e, t, r, o, l, u, i, c) {
            var s, a, d, f, p = n.visible, m = n.text;
            function v(e, t) {
                return p[e][t] <= n.tick
            }
            var h = m.length;
            function g(e, t) {
                return 0 <= e && h - 1 - e <= t && e < h && t < m[e].length && "#" == m[e][t]
            }
            e.textContent = m.map(function(e, t) {
                for (var n = [], r = h - 1 - t, o = 0; o < h + t; o++)
                    o < r || !v(t, o) ? n.push(" ") : n.push(e[o]);
                return n.join("")
            }).join("\n"),
            t.textContent = m.map(function(e, t) {
                for (var n = [], r = h - 1 - t, o = 0; o < h + t; o++)
                    o < r || v(t, o) ? n.push(" ") : n.push(e[o]);
                return n.join("")
            }).join("\n");
            var x = Object(C.traceAllWalls)(function(e) {
                for (var t = 0; t < h; t++)
                    for (var n = h - 2 - t; n < h + t; n++)
                        !g(t, n) && g(t, n + 1) && e(t, n + 1)
            }, g);
            if (r.setAttribute("d", x),
            n.tick == n.maxTick)
                return null !== (a = null === (s = document.querySelector("#example2wrapper .current.line")) || void 0 === s ? void 0 : s.classList) && void 0 !== a && a.remove("current"),
                o.setAttribute("d", ""),
                l.setAttribute("d", ""),
                i.setAttribute("d", ""),
                void u.setAttribute("d", "");
            null !== (f = null === (d = document.querySelector("#example2wrapper .current.line")) || void 0 === d ? void 0 : d.classList) && void 0 !== f && f.remove("current"),
            c[n.line[n.tick]].classList.add("current");
            var w = 5 + 10 * (h - 1)
              , b = 10 * n.row[n.tick]
              , y = b * n.start[n.tick]
              , k = b * n.end[n.tick]
              , E = w - 5 + 10 * Math.floor(.5 + n.row[n.tick] * n.start[n.tick])
              , j = 5 + w + 10 * Math.ceil(n.row[n.tick] * n.end[n.tick] - .5);
            u.setAttribute("d", "M " + E + " " + b + " H " + j + " v 10 H " + E + " Z"),
            o.setAttribute("d", "M " + w + " 5 l " + y + " " + b),
            l.setAttribute("d", "M " + w + " 5 l " + k + " " + b);
            var O, A, B = n.col[n.tick];
            null == B ? i.setAttribute("d", "") : (O = w + 10 * B,
            A = 5 + 10 * n.row[n.tick],
            i.setAttribute("d", "M " + (O - 5) + " " + (A - 5) + " l 10 0 l 0 10 l -10 0 Z"),
            i.classList.replace("double", "single"))
        }
        function j(r, o, s, a) {
            for (var d = s.visible, l = s.text, e = 0; e < d.length; e++)
                for (var t = 0; t < d[e].length; t++)
                    d[e][t] = 1 / 0;
            function f(e, t) {
                if (e.depth >= l.length)
                    return null;
                var n = e.depth;
                return [r + n, o + t]
            }
            function p(e, t) {
                var n = f(e, t);
                if (n) {
                    var r = n[0]
                      , o = n[1];
                    return "#" == l[r][o]
                }
                return 1
            }
            function m(e, t) {
                var n = f(e, t);
                if (n) {
                    var r = n[0]
                      , o = n[1];
                    return "·" == l[r][o]
                }
            }
            d[r][o] = 0,
            s.line = [0],
            s.start = [-1],
            s.end = [1],
            s.row = [0],
            s.col = [0],
            s.tick = 0;
            !function e(t) {
                if (!(t.depth > a)) {
                    v(1, t, null, s),
                    v(2, t, null, s);
                    for (var n, r, o, l, u = Object(C.minCol)(t); u <= Object(C.maxCol)(t); u++)
                        v(3, t, u, s),
                        (p(t, u) || Object(C.isSymmetric)(t, u)) && (v(4, t, u, s),
                        (l = f(t, u)) && (r = l[0],
                        o = l[1],
                        d[r][o] = s.tick + 1)),
                        u == Object(C.minCol)(t) ? (v(5, t, u, s),
                        v(7, t, u, s)) : (n = u - 1,
                        v(5, t, u, s),
                        p(t, n) && m(t, u) && (v(6, t, u, s),
                        t.start = Object(C.slope)(t, u)),
                        v(7, t, u, s),
                        m(t, n) && p(t, u) && (v(8, t, u, s),
                        v(9, t, u, s),
                        i = {
                            depth: t.depth + 1,
                            start: t.start,
                            end: Object(C.slope)(t, u)
                        },
                        v(10, t, u, s),
                        e(i))),
                        v(11, t, u, s);
                    var i, c = Object(C.maxCol)(t);
                    v(12, t, c, s),
                    m(t, c) && (v(13, t, c, s),
                    e(i = {
                        depth: t.depth + 1,
                        start: t.start,
                        end: t.end
                    })),
                    v(14, t, null, s)
                }
            }({
                depth: 1,
                start: {
                    num: -1,
                    den: 1
                },
                end: {
                    num: 1,
                    den: 1
                }
            }),
            s.maxTick = ++s.tick
        }
        function O(e, t, n) {
            return 0 <= e && e < n && n - 1 - e <= t && t < n + e
        }
        function v(e, t, n, r) {
            r.tick++,
            r.line.push(e),
            r.start.push(t.start.num / t.start.den),
            r.end.push(t.end.num / t.end.den),
            r.row.push(t.depth),
            r.col.push(n)
        }
    },
    "./src/example3.ts": function(e, t, n) {
        "use strict";
        function r() {
            var r, o, e, l = document.getElementById("tiles_line1"), u = document.getElementById("tiles_line2"), t = document.getElementById("tiles_slope1"), n = document.getElementById("tiles_slope2"), i = document.getElementsByClassName("inscribed");
            l && u && t && n && (r = t.valueAsNumber,
            o = n.valueAsNumber,
            (e = function() {
                var e = Math.min(r, o)
                  , t = Math.max(r, o);
                l.setAttribute("x2", "" + 3.125 * e),
                u.setAttribute("x2", "" + 3.125 * t);
                for (var n = 0; n < i.length; n++)
                    n < (e + 1) / 40 - .5 || (t - 1) / 40 + .5 < n ? i[n].setAttribute("stroke", "none") : i[n].setAttribute("stroke", "#fd8")
            }
            )(),
            t.addEventListener("input", function() {
                r = this.valueAsNumber,
                e()
            }),
            n.addEventListener("input", function() {
                o = this.valueAsNumber,
                e()
            }))
        }
        n.r(t),
        n.d(t, "initExample3", function() {
            return r
        })
    },
    "./src/fov_common.ts": function(e, t, n) {
        "use strict";
        function r(e, t) {
            return t * e.start.den >= e.depth * e.start.num && t * e.end.den <= e.depth * e.end.num
        }
        function o(e) {
            return Math.floor(.5 + e.depth * e.start.num / e.start.den)
        }
        function l(e) {
            return Math.ceil(e.depth * e.end.num / e.end.den - .5)
        }
        function u(e, t) {
            return {
                num: 2 * t - 1,
                den: 2 * e.depth
            }
        }
        function i(e, r) {
            var o = []
              , l = new Set;
            return e(function(e, t) {
                var n = {
                    row: e,
                    col: t,
                    edge: "W"
                };
                l.has(c(n)) || o.push(function(e, t, n) {
                    var r = [e];
                    t.add(c(e));
                    for (; r.push.apply(r, function(e, t) {
                        return t(s(e)) ? t(a(e)) ? [function(e) {
                            switch (e.edge) {
                            case "N":
                                return {
                                    row: e.row,
                                    col: e.col + .5,
                                    edge: e.edge
                                };
                            case "S":
                                return {
                                    row: e.row,
                                    col: e.col - .5,
                                    edge: e.edge
                                };
                            case "E":
                                return {
                                    row: e.row + .5,
                                    col: e.col,
                                    edge: e.edge
                                };
                            case "W":
                                return {
                                    row: e.row - .5,
                                    col: e.col,
                                    edge: e.edge
                                }
                            }
                        }(e), a(e)] : [s(e)] : [function(e) {
                            switch (e.edge) {
                            case "N":
                                return {
                                    row: e.row,
                                    col: e.col,
                                    edge: "E"
                                };
                            case "S":
                                return {
                                    row: e.row,
                                    col: e.col,
                                    edge: "W"
                                };
                            case "E":
                                return {
                                    row: e.row,
                                    col: e.col,
                                    edge: "S"
                                };
                            case "W":
                                return {
                                    row: e.row,
                                    col: e.col,
                                    edge: "N"
                                }
                            }
                        }(e)]
                    }(e, n)),
                    (e = r[r.length - 1]).row != r[0].row || e.col != r[0].col || e.edge != r[0].edge; )
                        "W" == e.edge && t.add(c(e));
                    return function(e) {
                        for (var t = "M " + c(e[0]), n = 1; n < e.length; n++)
                            t += " L " + c(e[n]);
                        return t
                    }(r)
                }(n, l, function(e) {
                    var t = e.row
                      , n = e.col;
                    return r(t, n)
                }))
            }),
            o.join(" ")
        }
        function c(e) {
            switch (e.edge) {
            case "N":
                return [5 + 10 * e.col, 5 + 10 * e.row - 5].join(" ");
            case "S":
                return [5 + 10 * e.col, 5 + 10 * e.row + 5].join(" ");
            case "E":
                return [5 + 10 * e.col + 5, 5 + 10 * e.row].join(" ");
            case "W":
                return [5 + 10 * e.col - 5, 5 + 10 * e.row].join(" ")
            }
        }
        function s(e) {
            switch (e.edge) {
            case "N":
                return {
                    row: e.row,
                    col: e.col + 1,
                    edge: e.edge
                };
            case "S":
                return {
                    row: e.row,
                    col: e.col - 1,
                    edge: e.edge
                };
            case "E":
                return {
                    row: e.row + 1,
                    col: e.col,
                    edge: e.edge
                };
            case "W":
                return {
                    row: e.row - 1,
                    col: e.col,
                    edge: e.edge
                }
            }
        }
        function a(e) {
            switch (e.edge) {
            case "N":
                return {
                    row: e.row - 1,
                    col: e.col + 1,
                    edge: "W"
                };
            case "S":
                return {
                    row: e.row + 1,
                    col: e.col - 1,
                    edge: "E"
                };
            case "E":
                return {
                    row: e.row + 1,
                    col: e.col + 1,
                    edge: "N"
                };
            case "W":
                return {
                    row: e.row - 1,
                    col: e.col - 1,
                    edge: "S"
                }
            }
        }
        n.r(t),
        n.d(t, "isSymmetric", function() {
            return r
        }),
        n.d(t, "minCol", function() {
            return o
        }),
        n.d(t, "maxCol", function() {
            return l
        }),
        n.d(t, "slope", function() {
            return u
        }),
        n.d(t, "traceAllWalls", function() {
            return i
        })
    },
    "./src/highlight.ts": function(e, t, n) {
        "use strict";
        function r(e, v) {
            var h, t = e.textContent;
            t && (h = function(e) {
                if (!e)
                    return "";
                var t = /(.*)(from|import)(.*)/.exec(e);
                if (null !== t)
                    return h(t[1]) + '<span class="key">' + t[2] + "</span>" + h(t[3]);
                var n = /^def (\w+)\((.*)\):/.exec(e);
                if (null !== n)
                    return v ? '<span class="key">def</span> <span class="def" id="' + n[1] + '">' + n[1] + "</span>(" + g(n[2]) + "):" : '<span class="key">def</span> <span class="def">' + n[1] + "</span>(" + g(n[2]) + "):";
                var r = /^class (\w+)(.*):/.exec(e);
                if (null !== r)
                    return v ? '<span class="key">class</span> <span class="def" id="' + r[1] + '">' + r[1] + "</span>" + r[2] + ":" : '<span class="key">class</span> <span class="def">' + r[1] + "</span>" + r[2] + ":";
                var o = /^return (.+)/.exec(e);
                if (null !== o)
                    return '<span class="key">return</span> ' + h(o[1]);
                if (null !== /^return/.exec(e))
                    return '<span class="key">return</span>';
                var l = /^yield (.+)/.exec(e);
                if (null !== l)
                    return '<span class="key">yield</span> ' + h(l[1]);
                var u = /^for (.+) in (.+):/.exec(e);
                if (null !== u)
                    return '<span class="key">for</span> ' + h(u[1]) + ' <span class="key">in</span> ' + h(u[2]) + ":";
                var i = /^while (.+):/.exec(e);
                if (null !== i)
                    return '<span class="key">while</span> ' + h(i[1]) + ":";
                var c = /^if (.+):/.exec(e);
                if (null !== c)
                    return '<span class="key">if</span> ' + h(c[1]) + ":";
                var s = /(.*)\b(\w+)\((.*)/.exec(e);
                if (null !== s)
                    return h(s[1]) + '<a class="fn" href="#' + s[2] + '">' + s[2] + "</a>(" + h(s[3]);
                var a = /^(.*) (and|or|==|>=|<=|is not|is|in|\+|\*|-|=) (.*)/.exec(e);
                if (null !== a)
                    return h(a[1]) + ' <span class="op">' + a[2] + "</span> " + h(a[3]);
                var d = /^(.*)not(.*)/.exec(e);
                if (null !== d)
                    return h(d[1]) + '<span class="op">not</span>' + h(d[2]);
                var f = /^(.*)\.(.*)/.exec(e);
                if (null !== f)
                    return h(f[1]) + '<span class="dot">.</span>' + h(f[2]);
                var p = /^(.+),(.*)/.exec(e);
                if (null !== p)
                    return h(p[1]) + '<span class="dot">,</span>' + h(p[2]);
                var m = /(.*)\bself\b(.*)/.exec(e);
                return null !== m ? h(m[1]) + '<span class="self">self</span>' + h(m[2]) : e
            }
            ,
            e.innerHTML = t.split("\n").map(function(e) {
                var t = /[^ ]/.exec(e);
                return null !== t && 0 < t.index ? '<div class="line">' + e.substring(0, t.index) + h(e.substring(t.index)) + "</div>" : '<div class="line">' + h(e) + "</div>"
            }).join("\n"))
        }
        function g(e) {
            var t = /^(.+), (.+)/.exec(e);
            return null !== t ? g(t[1]) + '<span class="dot">,</span> ' + g(t[2]) : e
        }
        n.r(t),
        n.d(t, "highlight", function() {
            return r
        })
    },
    "./src/index.ts": function(e, t, n) {
        "use strict";
        n.r(t);
        for (var r = n("./src/highlight.ts"), o = n("./src/example0.ts"), l = n("./src/example1.ts"), u = n("./src/example2.ts"), i = n("./src/example3.ts"), c = document.querySelectorAll("#appendix .python3"), s = 0; s < c.length; s++)
            Object(r.highlight)(c[s], !0);
        c = document.querySelectorAll("#example2wrapper .python3");
        for (s = 0; s < c.length; s++)
            Object(r.highlight)(c[s], !1);
        Object(o.initExample0)(33, 11),
        Object(l.initExample1)(),
        Object(u.initExample2)(8),
        Object(i.initExample3)()
    }
});
