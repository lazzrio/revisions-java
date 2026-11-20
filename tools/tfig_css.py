# -*- coding: utf-8 -*-
"""CSS des figures de gen_test5_figs.py (variables de css/style.css uniquement : thèmes clair et sombre)."""
CSS = r"""
.tfig{margin:16px 0;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px;min-width:0}
.tfig svg{display:block;width:100%;max-width:520px;height:auto;margin:0 auto;overflow:visible}
.tfig figcaption{font-size:13.5px;color:var(--muted);margin-top:8px;text-align:left}
.tfig figcaption b{color:var(--ink)}
.tfig figcaption code{font-family:var(--f-mono);font-size:.92em;background:var(--surface2);border:1px solid var(--line2);border-radius:4px;padding:.05em .3em}
.tfig text{font-family:var(--f-body);font-size:12.5px;fill:var(--ink)}
.tfig text.m,.tfig tspan.m{font-family:var(--f-mono)}
.tfig text.k,.tfig tspan.k{font-weight:600}
.tfig text.s{font-size:11.5px;fill:var(--muted)}
.tfig text.xs{font-size:10.5px}
.tfig text.h{font-size:13px;font-weight:600;fill:var(--accent)}
.tfig text.g{fill:var(--good)}
.tfig text.r{fill:var(--bad)}
.tfig text.a{fill:var(--accent)}
.tfig text.t{fill:var(--accent2)}
.tfig text.lb{paint-order:stroke;stroke:var(--surface);stroke-width:4px;stroke-linejoin:round}
.tfig text.nt{font-size:11px;font-weight:700;fill:var(--surface)}
.tfig .bx{fill:var(--surface2);stroke:var(--muted);stroke-width:1.2}
.tfig .bx.p{fill:var(--surface2);stroke:var(--muted)}
.tfig .bx.a{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.4}
.tfig .bx.t{fill:var(--teal-soft);stroke:var(--accent2);stroke-width:1.4}
.tfig .bx.g{fill:var(--good-soft);stroke:var(--good);stroke-width:1.4}
.tfig .bx.r{fill:var(--bad-soft);stroke:var(--bad);stroke-width:1.4}
.tfig .bx.s{fill:var(--surface);stroke:var(--muted);stroke-dasharray:4 3}
.tfig .ln{fill:none;stroke:var(--ink);stroke-width:1.4}
.tfig .ln.d{stroke-dasharray:5 3}
.tfig .ln.m{stroke:var(--muted)}
.tfig .ln.a{stroke:var(--accent)}
.tfig .ln.g{stroke:var(--good)}
.tfig .ln.r{stroke:var(--bad)}
.tfig .life{fill:none;stroke:var(--muted);stroke-width:1;stroke-dasharray:3 4}
.tfig .mk{fill:var(--ink)}
.tfig .mk.a{fill:var(--accent)}
.tfig .mk.g{fill:var(--good)}
.tfig .mk.r{fill:var(--bad)}
.tfig .mk.tri{fill:var(--surface);stroke:var(--ink);stroke-width:1.2}
.tfig .nb{fill:var(--accent)}
.tfig-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:14px;margin:14px 0;align-items:start}
.tfig-grid .tfig{margin:0}
"""
