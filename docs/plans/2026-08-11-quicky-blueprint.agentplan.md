```agentplan
@META id=BP-2026-0811-01|repo=Quicky|head=<fill-after>|branch=master
@STACK flutter 3.44.9|dart pub|flutter test|github-actions
@GATE build=flutter pub get && flutter analyze|test=flutter test|lint=flutter analyze|types=dart analyze
@ENTRY lib/main.dart|?(greenfield — created in J2; gates on J1 scaffold)
@FACT F1 repo is greenfield: no lib/ source tree exists; only docs/plan/STACK.md/.git present|search_files *.=30 matches, none under lib/
@FACT F2 flutter 3.44.9 stable installed (plan requires >=3.24)|flutter --version
@FACT F3 launcher contract: installed-app-only + background-resident + permission-gated (no store deep-link)|plan:287-321
@FACT F4 verified Android package ids (Play Store, 2026-08-11): BOLT ee.mtakso.client, SCB com.scb.phone, KBank com.kasikorn.retail.mbanking.wap, BBL com.bbl.mobilebanking, KTB ktbcs.netbank, TTB com.TMBTOUCH.PRODUCTION|plan:306-315
@FACT F5 plan + STACK.md already encode verified launcher facts; no re-verify needed|plan:306-315,STACK.md:111
@RISK R1 Android 11+ QUERY_ALL_PACKAGES denied → launcher cannot enumerate installed apps|blast=narrow
@RISK R2 stray non-Quicky files in repo root (devils-dice-masterpiece.html, docs/architecture-diagram.html) must NEVER be committed|blast=narrow
@GAP G1 no Dart source tree exists (greenfield)|conf=high|checked=search_files * 
@DONE D1 plan + STACK.md already hold verified launcher facts (no rebuild)|plan:306-315,STACK.md:111
@DONE D2 architecture-quicky.html already documents the component map (reference only, not code)|docs/architecture-quicky.html
@BAN .env|*.pem|~/.hermes/profiles/|devils-dice-masterpiece.html|docs/architecture-diagram.html

@JOB J1 [X] scope=./|goal=scaffold flutter project: pubspec.yaml (all deps), analysis_options.yaml (very_good_analysis), .gitignore, README.md, .github/workflows/ci.yml (Tasks 0.1-0.2)|needs=F1|gate=flutter analyze
@JOB J2 [X] scope=lib/core|goal=router (GoRouter) + theme (M3 light/dark) + l10n (en/th ARB) (Tasks 1.1-1.2)|needs=J1|gate=flutter analyze
@JOB J3 [X] scope=lib/shared/widgets|goal=octagon_tile + dashboard_layout (trigonometry) + loading_splash (Tasks 1.3)|needs=J2|gate=flutter analyze
@JOB J4 [X] scope=lib/features/splash|goal=splash_page (animated, 2s min, pushReplacement /) (Task 2.1)|needs=J2|gate=flutter analyze
@JOB J5 [X] scope=lib/features/dashboard|goal=dashboard_page + dashboard_controller (8 OctagonTiles) (Task 2.2)|needs=J3|gate=flutter analyze
@JOB J6 [X] scope=lib/features/cost|goal=cost_page + cost_controller + cost_result_card (camera, Thai phrase, copy) (Tasks 3.1-3.3)|needs=J3|gate=flutter analyze
@JOB J7 [X] scope=lib/features/location|goal=location_page + controller + geocode_service (camera/gallery, Thai phrase) (Tasks 4.1-4.3)|needs=J3|gate=flutter analyze
@JOB J8 [X] scope=lib/features/bathroom|goal=bathroom_page + controller (toggle, persist) (Task 5)|needs=J3|gate=flutter analyze
@JOB J9 [X] scope=lib/features/attractions|goal=attractions_page + controller + places_service + attraction_card (Tasks 6.1-6.3)|needs=J3|gate=flutter analyze
@JOB J10 [X] scope=lib/features/counter|goal=counter_page + controller (countdown, persist) (Task 7)|needs=J2|gate=flutter analyze
@JOB J11 [X] scope=lib/features/bolt|goal=bolt_page + bolt_service (installed-app check, launch ee.mtakso.client, bg-resident) (Task 8.1)|needs=J3,F3,F4|gate=flutter analyze
@JOB J12 [X] scope=lib/features/banking|goal=banking_page + banking_service (per-bank verified package map, installed-only, bg-resident) (Task 8.2)|needs=J3,F3,F4|gate=flutter analyze
@JOB J13 [X] scope=lib/features/weather|goal=weather_page + controller + weather_service (Tasks 9.1-9.2)|needs=J3|gate=flutter analyze
@JOB J14 [X] scope=lib/features/settings|goal=settings_page + controller + sections/ (8 sections, persist via shared_preferences + flutter_secure_storage) (Task 10)|needs=J5|gate=flutter analyze
@JOB J15 [X] scope=test|goal=unit/widget/integration tests per feature (Task 11.1-11.3)|needs=J6,J7,J8,J9,J10,J11,J12,J13,J14|gate=flutter test

@SEQ J1->J2->J3->(J4 par J5 par J6 par J7 par J8 par J9 par J10 par J11 par J12 par J13)->J14->J15
@EXIT all JOB=[X] && GATE(test)=0 && GATE(types)=0
```

<!--
STEP 0 BLUEPRINT NOTES (orchestrator):
- Greenfield repo; J1 is the only blocker. Everything else sequences off the scaffold.
- Flutter 3.44.9 satisfies plan's 3.24+ requirement; no toolchain work needed.
- Launcher facts (F3/F4) are already verified and written into plan+STACK — subagents
  MUST NOT re-derive package ids; use the values in F4 verbatim.
- @BAN enforces: stray non-Quicky artifacts (devils-dice-masterpiece.html,
  docs/architecture-diagram.html) and secrets/profiles are never committed.
- Dispatch rule: max 2 concurrent Worker+Verifier pairs. After J3, J4-J13 may run
  2-at-a-time; J14 needs J5; J15 is last (needs all features).
-->
