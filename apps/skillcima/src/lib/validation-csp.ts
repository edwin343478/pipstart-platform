"use client";

import { z } from "zod";

// Zod captures this setting when constructing object schemas. Import this module
// before the validation schema, not inside a component or after other imports.
z.config({ jitless: true });
