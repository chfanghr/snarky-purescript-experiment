module Main where

import Prelude hiding (Void)

import Effect (Effect)
import Effect.Class
import Effect.Aff
import Effect.Console (log)
import SnarkyPS.Lib.Context
import SnarkyPS.Lib.Bool
import SnarkyPS.Lib.Field
import SnarkyPS.Lib.FieldClasses
import SnarkyPS.Lib.Circuit

testFunc ::  Bool ->  Bool -> Context Void
testFunc = \b1 b2 -> assertTrue "Test 1" (b1 #== b2)

testCirc :: Circuit Bool Bool
testCirc = mkCircuit testFunc

testProof :: Aff (Proof Bool Bool)
testProof = prove testCirc (bool true) (bool true)

main :: Effect Unit
main = launchAff_  do
  proof <- testProof
  liftEffect $ debug proof
