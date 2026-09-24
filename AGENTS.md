<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 협업 규칙

- 요청 범위와 관계없는 코드·파일·기존 변경 사항은 수정하지 않는다.
- 재할당하지 않는 값은 `const`로 선언하고, 필요한 경우에만 `let`을 사용한다. `var`는 사용하지 않는다.
- 함수, 컴포넌트, 모듈은 하나의 명확한 책임만 가진다. UI, 상태, 도메인 로직, 데이터 접근 책임이 섞이면 분리한다.
- 역할에 맞는 폴더에 코드를 둔다: 라우트는 `app/`, 재사용 UI는 `components/`, 기능별 로직은 `features/`, 공용 순수 함수는 `lib/`, 정적·시드 데이터는 `data/`, 테스트는 `tests/`에 둔다.
- 기존 로직을 먼저 재사용하고, 여러 곳에서 필요한 로직만 적절한 공용 모듈로 추출한다.