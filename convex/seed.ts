import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed function to create sample problems
export const seedProblems = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Check if problems already exist
    const existing = await ctx.db.query("problems").first();
    if (existing) {
      return { message: "Problems already seeded" };
    }

    // Problem 1: Two Sum (Easy)
    await ctx.db.insert("problems", {
      title: "Two Sum",
      slug: "two-sum",
      difficulty: "Easy",
      description: `<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
<p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
<p>You can return the answer in any order.</p>`,
      constraints: `<ul>
<li>2 &lt;= nums.length &lt;= 10<sup>4</sup></li>
<li>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></li>
<li>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></li>
<li>Only one valid answer exists.</li>
</ul>`,
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
        },
        {
          input: "nums = [3,2,4], target = 6",
          output: "[1,2]",
        },
        {
          input: "nums = [3,3], target = 6",
          output: "[0,1]",
        },
      ],
      testCases: [
        { input: "[2,7,11,15], 9", expectedOutput: "[0,1]", isHidden: false },
        { input: "[3,2,4], 6", expectedOutput: "[1,2]", isHidden: false },
        { input: "[3,3], 6", expectedOutput: "[0,1]", isHidden: false },
        { input: "[1,5,3,7,9], 12", expectedOutput: "[2,4]", isHidden: true },
      ],
      starterCode: {
        cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
    }
};`,
        java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
    }
}`,
        python: `class Solution(object):
    def twoSum(self, nums, target):
        """
        :type nums: List[int]
        :type target: int
        :rtype: List[int]
        """
        # Write your code here
        `,
        python3: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your code here
        pass`,
        javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your code here
};`,
        typescript: `function twoSum(nums: number[], target: number): number[] {
    // Write your code here
}`,
      },
      tags: ["Array", "Hash Table"],
      totalSubmissions: 0,
      totalAccepted: 0,
      createdBy: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Problem 2: Palindrome Number (Easy)
    await ctx.db.insert("problems", {
      title: "Palindrome Number",
      slug: "palindrome-number",
      difficulty: "Easy",
      description: `<p>Given an integer <code>x</code>, return <code>true</code> if <code>x</code> is a palindrome, and <code>false</code> otherwise.</p>
<p>A palindrome is a number that reads the same backward as forward.</p>`,
      constraints: `<ul>
<li>-2<sup>31</sup> &lt;= x &lt;= 2<sup>31</sup> - 1</li>
</ul>`,
      examples: [
        {
          input: "x = 121",
          output: "true",
          explanation: "121 reads as 121 from left to right and from right to left.",
        },
        {
          input: "x = -121",
          output: "false",
          explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.",
        },
        {
          input: "x = 10",
          output: "false",
          explanation: "Reads 01 from right to left. Therefore it is not a palindrome.",
        },
      ],
      testCases: [
        { input: "121", expectedOutput: "true", isHidden: false },
        { input: "-121", expectedOutput: "false", isHidden: false },
        { input: "10", expectedOutput: "false", isHidden: false },
        { input: "12321", expectedOutput: "true", isHidden: true },
      ],
      starterCode: {
        cpp: `class Solution {
public:
    bool isPalindrome(int x) {
        // Write your code here
    }
};`,
        java: `class Solution {
    public boolean isPalindrome(int x) {
        // Write your code here
    }
}`,
        python3: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Write your code here
        pass`,
        javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    // Write your code here
};`,
      },
      tags: ["Math"],
      totalSubmissions: 0,
      totalAccepted: 0,
      createdBy: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Problem 3: Reverse Linked List (Medium)
    await ctx.db.insert("problems", {
      title: "Reverse Linked List",
      slug: "reverse-linked-list",
      difficulty: "Medium",
      description: `<p>Given the <code>head</code> of a singly linked list, reverse the list, and return the reversed list.</p>`,
      examples: [
        {
          input: "head = [1,2,3,4,5]",
          output: "[5,4,3,2,1]",
        },
        {
          input: "head = [1,2]",
          output: "[2,1]",
        },
        {
          input: "head = []",
          output: "[]",
        },
      ],
      testCases: [
        { input: "[1,2,3,4,5]", expectedOutput: "[5,4,3,2,1]", isHidden: false },
        { input: "[1,2]", expectedOutput: "[2,1]", isHidden: false },
        { input: "[]", expectedOutput: "[]", isHidden: true },
      ],
      starterCode: {
        cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your code here
    }
};`,
        java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your code here
    }
}`,
        python3: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Write your code here
        pass`,
        javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
    // Write your code here
};`,
      },
      tags: ["Linked List", "Recursion"],
      totalSubmissions: 0,
      totalAccepted: 0,
      createdBy: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { message: "Successfully seeded 3 problems" };
  },
});
