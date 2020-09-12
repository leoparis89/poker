import { Hand } from "pokersolver";

test("poker solver smoke test", () => {
  var hand1 = Hand.solve(["Ad", "As", "Jc", "Th", "2d", "3c", "Kd"]);
  var hand2 = Hand.solve(["Ad", "As", "Jc", "Th", "2d", "Qs", "Qd"]);
  var [winner] = Hand.winners([hand1, hand2]); // hand2
  expect(winner).toEqual(hand2);
});
