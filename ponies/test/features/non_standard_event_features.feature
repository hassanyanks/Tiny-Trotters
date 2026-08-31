Feature:  I want to allow customers to specify event types and pony accessories not in our standard lists

Background:
Given I visit "https://localhost:443"
And I start to "Schedule an Event"

############################################################################################################################
@tiny_trotters, @no_ponies_selected
Scenario:  On Schedule Event page, no ponies selected
############################################################################################################################

Then I "should not" see these elements:

|   element type   |           text           |              name                 |            id            |
| label            | Role                     |                                   |                          |
| label            | Accessories              |                                   |                          |
| label            | Other Accessories        |                                   |                          |
| label            | Clear Other Accessories  |                                   |                          |
| label            | Clear All                |                                   |                          |
| input            |                          | Pony Other Accessories Prince     |                          |
| input            |                          | other-accessory-reset-box-Prince  |                          |
| input            |                          | Pony Role Prince                  |                          |
| input            |                          |                                   | clear-accessories-Prince |
| select           |                          | Pony Accessories Rooster          |                          |
| input            |                          | Pony Other Accessories Rooster    |                          |
| input            |                          | other-accessory-reset-box-Rooster |                          |
| input            |                          | Pony Role Rooster                 |                          |
| input            |                          |                                   | clear-accessories-Prince |
| select           |                          | Pony Accessories Rooster          |                          |

############################################################################################################################
@tiny_trotters, @Prince_selected, @Prince_accessories
Scenario:  Scheduling event, other accessories input
############################################################################################################################

And I click pony "Prince"

Then I "should" see a "role-input" field for "Prince"
And I "should" see a "accessories-select" field for "Prince" 
And I "should" see a "clear-accessories-input" field for "Prince" 
And I "should not" see a "other-accessory-input" field for "Prince" 
And I "should not" see a "other-accessory-reset-box-input" field for "Prince" 

When I select "Other" in the "Accessories" field
Then I "should" see a "other-accessory-reset-box-input" field for "Prince" 
And I "should" see a "other-accessory-input" field for "Prince" 

When I enter "some other accessory" into the "other-accessory-input" field for "Prince" 
And I deselect "Other" in the "Accessories" field
Then I "should not" see a "other-accessory-reset-box-input" field for "Prince" 
And I "should not" see a "other-accessory-input" field for "Prince" 

When I select "Other" in the "Accessories" field
Then the "other-accessory-input" field for "Prince" will have a value of ""

############################################################################################################################
@tiny_trotters, @Prince_selected
Scenario:  Scheduling event, clearing all
############################################################################################################################

When I select "Hair Tinsel" in the "Accessories" field
And I select "Pearls" in the "Accessories" field
And I click the "Clear checkbox"

When I enter "some role" into the "role-input" field for "Prince" 
And I unclick the "Prince checkbox"
And I click the "Prince checkbox"
Then the "role-input" field for "Prince" will have a value of ""
