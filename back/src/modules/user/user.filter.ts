import { FilterMap } from "bradb";
import { z } from "zod";

// Sin filtros: no hay endpoint de listado, pero `ServiceBuilder` exige un
// `FilterMap` en su constructor.
export const userFilterMap: FilterMap<z.ZodObject> = {};
