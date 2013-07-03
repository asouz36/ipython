//----------------------------------------------------------------------------
//  Copyright (C) 2008-2011  The IPython Development Team
//
//  Distributed under the terms of the BSD License.  The full license is in
//  the file COPYING, distributed as part of this software.
//----------------------------------------------------------------------------

//============================================================================
// Notebook
//============================================================================

var IPython = (function (IPython) {
    
    var Session = function(notebook_path, Notebook){
        this.kernel = null;
        this.kernel_id = null;
        this.session_id = null;
        this.notebook_path = notebook_path;
        this.notebook = Notebook;
    };
    
    Session.prototype.start = function(){
        var that = this
        var qs = $.param({notebook_path:this.notebook_path});
        var url = '/api/sessions' + '?' + qs;
        $.post(url, 
            $.proxy(this.start_kernel, that),
            'json'
        );
    };
    
    // Kernel related things

    /**
     * Start a new kernel and set it on each code cell.
     * 
     * @method start_kernel
     */
    Session.prototype.start_kernel = function (json) {
        this.session_id = json.session_id;
        this.kernel_content = json.kernel;
        var base_url = $('body').data('baseKernelUrl') + "api/kernels";
        this.kernel = new IPython.Kernel(base_url, this.session_id);
        // Now that the kernel has been created, tell the CodeCells about it.
        this.kernel._kernel_started(this.kernel_content)
        var ncells = this.notebook.ncells();
        for (var i=0; i<ncells; i++) {
            var cell = this.notebook.get_cell(i);
            if (cell instanceof IPython.CodeCell) {
                cell.set_kernel(this.kernel)
            };
        };
        
    };
    
    /**
     * Prompt the user to restart the IPython kernel.
     * 
     * @method restart_kernel
     */
    Session.prototype.restart_kernel = function () {
        var that = this;
        var dialog = $('<div/>');
        dialog.html('Do you want to restart the current kernel?  You will lose all variables defined in it.');
        $(document).append(dialog);
        dialog.dialog({
            resizable: false,
            modal: true,
            title: "Restart kernel or continue running?",
            closeText: '',
            buttons : {
                "Restart": function () {
                    that.kernel.restart();
                    $(this).dialog('close');
                },
                "Continue running": function () {
                    $(this).dialog('close');
                }
            }
        });
    };
    
    IPython.Session = Session;


    return IPython;

}(IPython));