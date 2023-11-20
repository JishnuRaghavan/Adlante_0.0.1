// Create an array to store customer data
const customerDataArray = [];
// Function to add customer data to the table
function addCustomerToTable(customer) {
// Generate HTML for the new customer row
const newRowHTML = `
<tr>
  <td class=" pe-0">
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value=""
        id="contactCheckbox2">
      <label class="form-check-label" for="contactCheckbox2">
      </label>
    </div>
  </td>
  <td class="ps-1">
    <div class="d-flex align-items-center">
      <a href="#!"><% if (userDataAdded && userDataAdded.image) { %><%= userDataAdded.image %><% } %></a>
      <div class="ms-2">
        <h5 class="mb-0"><a href="#!" class="text-inherit"><% if (userDataAdded) { %><%= userDataAdded.name %><% } %></a></h5>
      </div>
    </div>
  </td>
  <td><% if (userDataAdded) { %><%= userDataAdded.mobile %><% } %></td>
  <td><% if (userDataAdded) { %><%= userDataAdded.email %><% } %></td>
  <td>Florida, United States</td>
  <td>
    <% if (userDataAdded && userDataAdded.joinedDate) { %>
    <%= userDataAdded.joinedDate.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }) %>
    <% } %>
  </td>
  <td><span class="badge badge-success-soft text-success"><% if(userDataAdded) { %><%= userDataAdded.active %><% } %></span></td>
  <td>
    <a
      href="#!"
      class="btn btn-ghost btn-icon btn-sm rounded-circle texttooltip"
      data-template="editOne"
      >
      <i
        data-feather="edit"
        class="icon-xs"
        ></i>
      <div id="editOne" class="d-none">
        <span>Edit</span>
      </div>
    </a>
    <a
      href="#!"
      class="btn btn-ghost btn-icon btn-sm rounded-circle texttooltip"
      data-template="trashOne"
      >
      <i
        data-feather="trash-2"
        class="icon-xs"
        ></i>
      <div id="trashOne" class="d-none">
        <span>Delete</span>
      </div>
    </a>
  </td>
</tr>
`;
// Append the new row to the table body
$('#customerTableBody').append(newRowHTML);
}
// Push the new customer data to the array
customerDataArray.push(newCustomer);
// Add the new customer to the table
addCustomerToTable(newCustomer);