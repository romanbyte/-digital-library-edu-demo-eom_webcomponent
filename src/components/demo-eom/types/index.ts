/**
 * Справочник Verb'ов для передачи в родительское окно
 */

export type XdcXApiEventVerb =
  | 'answered'
  | 'completed'
  | 'hinted'
  | 'launched'
  | 'passed'
  | 'started'

export type XdcXApiEventInfo =
  | undefined
  | {
      eomID: string
    }
